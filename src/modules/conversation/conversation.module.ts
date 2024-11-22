import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schema/conversation.schema';
import { ConversationService } from './service/conversation.service';
import { OpenConversationService } from './service/openConversation.service';
import {
  OpenConversation,
  OpenConversationSchema,
} from './schema/openConversaion.schema';
import {
  AgentPropertyInvite,
  AgentPropertyInviteSchema,
} from '../property/schema/agentPropertyInvite.schema';
import { Property, PropertySchema } from '../property/schema/property.schema';
import { Agent } from 'http';
import { AgentSchema } from '../agent/schema/agent.schema';
import { User, UserSchema } from '../users/schema/user.schema';
import { Offer, OfferSchema } from '../property/schema/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: OpenConversation.name, schema: OpenConversationSchema },
      { name: AgentPropertyInvite.name, schema: AgentPropertyInviteSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Agent.name, schema: AgentSchema },
      { name: User.name, schema: UserSchema },
      { name: Offer.name, schema: OfferSchema },
    ]),
  ],
  exports: [ConversationService, OpenConversationService],
  providers: [ConversationService, OpenConversationService],
  controllers: [],
})
export class ConversationServiceModule {}
