import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { configs } from './configs';
import { User, UserSchema } from './modules/users/schema/user.schema';
import { AuthModule } from './modules/auth/auth.module';
import { AgentsModule } from './modules/agent/agents.module';
import { Agent, AgentSchema } from './modules/agent/schema/agent.schema';

@Module({
  imports: [
    MongooseModule.forRoot(configs.MONGO_DB_URL),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Agent.name, schema: AgentSchema },
    ]),
    UsersModule,
    AuthModule,
    AgentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
