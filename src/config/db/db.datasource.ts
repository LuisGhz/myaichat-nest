import { ConfigModule } from '@nestjs/config';
import { typeormConfig } from './db.typeorm';
import { DataSource } from 'typeorm';

ConfigModule.forRoot({
  isGlobal: true,
  load: [typeormConfig],
});
export default new DataSource({
  ...typeormConfig(),
  entities: [__dirname + '/../../**/*.entity{.ts}'],
  migrations: [__dirname + '/../../migrations/*{.ts}'],
} as any);
