import { PromptMessageRole } from '../entities';

export class PromptMessageResDto {
  id: string;
  role: PromptMessageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PromptResDto {
  id: string;
  name: string;
  content: string;
  messages: PromptMessageResDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class PromptListItemResDto {
  id: string;
  name: string;
  content: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PromptListItemSummaryResDto {
  id: string;
  name: string;
}
