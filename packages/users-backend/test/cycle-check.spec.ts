// Loading a deep module first used to leave JWT_AUTH undefined mid-cycle and
// break Nest DI; the barrel-first workaround is no longer needed.
import { AuthModule } from '../src/auth/auth.module';
import { JWT_AUTH } from '../src/auth/auth-strategies.constants';
import { JwtAuthStrategy } from '../src/jwt-auth/jwt-auth.srtategy';

describe('module loading order', () => {
  it('resolves strategy constants when a deep module is imported first', () => {
    expect(JWT_AUTH).toBe('jwt');
    expect(AuthModule).toBeDefined();
    expect(Reflect.getMetadata('design:paramtypes', JwtAuthStrategy)).not.toContain(undefined);
  });
});
