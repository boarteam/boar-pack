import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { UsersModule } from '../src/users/users.module';
import { UsersService } from '../src/users/users.service';
import { Roles, User } from '../src/users/entities/user.entity';
import { createTestDatabase, testDataSourceOptions } from './pg';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SEEDED_ADMIN_EMAIL = 'test-admin@test.test';

async function bootModule(database: string): Promise<TestingModule> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(testDataSourceOptions(database, [User])),
      UsersModule.register({ withControllers: false }),
    ],
  }).compile();
  // init() runs onModuleInit hooks, i.e. the admin seeding
  await moduleRef.init();
  return moduleRef;
}

describe('UsersService (Postgres)', () => {
  describe('onModuleInit seeding', () => {
    it('creates a default admin with a hashed password when the table is empty', async () => {
      const moduleRef = await bootModule(await createTestDatabase());
      try {
        const service = moduleRef.get(UsersService);
        await expect(service.count()).resolves.toBe(1);

        const admin = await service.findByEmail(SEEDED_ADMIN_EMAIL);
        expect(admin).toBeTruthy();
        expect(admin!.role).toBe(Roles.ADMIN);
        // Password is stored as a bcrypt hash of 'test', never plaintext
        expect(admin!.pass).not.toBe('test');
        expect(admin!.pass).toMatch(/^\$2[aby]\$/);
        await expect(bcrypt.compare('test', admin!.pass!)).resolves.toBe(true);
      } finally {
        await moduleRef.close();
      }
    });

    it('does not seed when users already exist', async () => {
      const database = await createTestDatabase();

      // Pre-populate the database outside of the Nest app
      const ds = new DataSource(testDataSourceOptions(database, [User]));
      await ds.initialize();
      await ds.getRepository(User).save({
        name: 'Existing',
        email: 'existing@test.test',
        role: Roles.USER,
      });
      await ds.destroy();

      const moduleRef = await bootModule(database);
      try {
        const service = moduleRef.get(UsersService);
        await expect(service.count()).resolves.toBe(1);
        await expect(service.findByEmail(SEEDED_ADMIN_EMAIL)).resolves.toBeNull();
      } finally {
        await moduleRef.close();
      }
    });

    it('does not seed when SWAGGER=true', async () => {
      process.env.SWAGGER = 'true';
      try {
        const moduleRef = await bootModule(await createTestDatabase());
        try {
          const service = moduleRef.get(UsersService);
          await expect(service.count()).resolves.toBe(0);
        } finally {
          await moduleRef.close();
        }
      } finally {
        delete process.env.SWAGGER;
      }
    });
  });

  describe('CRUD', () => {
    let moduleRef: TestingModule;
    let service: UsersService;

    beforeAll(async () => {
      moduleRef = await bootModule(await createTestDatabase());
      service = moduleRef.get(UsersService);
    });

    afterAll(async () => {
      await moduleRef?.close();
    });

    it('create persists a user with generated id and column defaults', async () => {
      const created = await service.create({
        name: 'Bob',
        email: 'bob@spec.test',
      });
      expect(created.id).toMatch(UUID_RE);

      const found = await service.findByEmail('bob@spec.test');
      expect(found).toMatchObject({
        id: created.id,
        name: 'Bob',
        email: 'bob@spec.test',
        role: Roles.USER,
        permissions: [],
        pass: null,
      });
      expect(found!.deletedAt).toBeNull();
    });

    it('create stores pass exactly as given — hashing is the callers responsibility', async () => {
      // Password hashing happens at the controller layer (HashPasswordInterceptor)
      // and in the seeding path, not inside UsersService.create.
      await service.create({
        name: 'Plain',
        email: 'plain@spec.test',
        pass: 'plaintext-secret',
      });

      const [row] = await service.repo.query('SELECT pass FROM users WHERE email = $1', [
        'plain@spec.test',
      ]);
      expect(row.pass).toBe('plaintext-secret');
    });

    it('findByEmail lowercases the lookup email', async () => {
      await service.create({ name: 'Case', email: 'case@spec.test' });

      const found = await service.findByEmail('CASE@Spec.Test');
      expect(found?.email).toBe('case@spec.test');
      await expect(service.findByEmail('missing@spec.test')).resolves.toBeNull();
    });

    it('does not normalize the stored email, so mixed-case emails are unfindable by findByEmail', async () => {
      // create() saves the email as given while findByEmail lowercases the
      // query — normalization is only enforced by UserCreateDto (Joi
      // .lowercase()) at the controller boundary. Documenting current
      // behavior: a mixed-case email created directly through the service
      // cannot be found by findByEmail.
      await service.create({ name: 'Mixed', email: 'MixedCase@Spec.Test' });

      await expect(service.findByEmail('MixedCase@Spec.Test')).resolves.toBeNull();
      const found = await service.findOne({ where: { email: 'MixedCase@Spec.Test' } });
      expect(found?.name).toBe('Mixed');
    });

    it('rejects duplicate emails via the unique constraint', async () => {
      await service.create({ name: 'First', email: 'dupe@spec.test' });

      await expect(service.create({ name: 'Second', email: 'dupe@spec.test' })).rejects.toThrow(
        /duplicate key value violates unique constraint/,
      );
    });

    it('updates are visible through service reads', async () => {
      const created = await service.create({
        name: 'Before',
        email: 'update-me@spec.test',
      });

      await service.repo.update(created.id, {
        name: 'After',
        permissions: ['view_users'],
      });

      const found = await service.findByEmail('update-me@spec.test');
      expect(found!.name).toBe('After');
      expect(found!.permissions).toEqual(['view_users']);
    });

    it('soft-deleted users disappear from service reads', async () => {
      const created = await service.create({
        name: 'Doomed',
        email: 'doomed@spec.test',
      });
      const countBefore = await service.count();

      await service.repo.softDelete(created.id);

      await expect(service.findByEmail('doomed@spec.test')).resolves.toBeNull();
      await expect(service.count()).resolves.toBe(countBefore - 1);

      // The row still exists, only marked as deleted
      const withDeleted = await service.findOne({
        where: { id: created.id },
        withDeleted: true,
      });
      expect(withDeleted?.deletedAt).toBeInstanceOf(Date);
    });
  });
});
