import { Column, DataSource, Entity, PrimaryGeneratedColumn } from 'typeorm';
// Importing the package root applies the SelectQueryBuilder patch as a side
// effect (src/tools/select-query-builder.extension.ts) — that is the public
// contract consumers rely on.
import { Tools } from '../src';
import { createTestDataSource } from './pg';

@Entity('vc_items')
class VcItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('int')
  price: number;

  @Tools.VirtualColumn('total')
  total?: number;
}

describe('Tools.VirtualColumn + SelectQueryBuilder patch (Postgres)', () => {
  let ds: DataSource;

  beforeAll(async () => {
    ds = await createTestDataSource([VcItem]);
    await ds.getRepository(VcItem).save([
      { name: 'apples', price: 2 },
      { name: 'pears', price: 3 },
    ]);
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  it('hydrates decorated properties from raw select aliases', async () => {
    const items = await ds
      .getRepository(VcItem)
      .createQueryBuilder('i')
      .addSelect('i.price * 10', 'total')
      .orderBy('i.id', 'ASC')
      .getMany();

    expect(items.map((i) => i.total)).toEqual([20, 30]);
    // regular columns are untouched
    expect(items.map((i) => i.name)).toEqual(['apples', 'pears']);
  });

  it('leaves virtual properties undefined when the alias is not selected', async () => {
    const items = await ds
      .getRepository(VcItem)
      .createQueryBuilder('i')
      .orderBy('i.id', 'ASC')
      .getMany();

    expect(items[0].total).toBeUndefined();
  });
});
