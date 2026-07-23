import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { LeadsModule } from './leads/leads.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { Contact } from './contacts/contact.entity';
import { Lead } from './leads/lead.entity';
import { Opportunity } from './opportunities/opportunity.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER', 'leadflow'),
        password: config.get<string>('DB_PASSWORD', 'leadflow'),
        database: config.get<string>('DB_NAME', 'leadflow'),
        entities: [User, Contact, Lead, Opportunity],
        synchronize: false,
      }),
    }),
    UsersModule,
    AuthModule,
    ContactsModule,
    LeadsModule,
    OpportunitiesModule,
  ],
})
export class AppModule {}
