export class ModelDeveloperResDto {
  id: string;
  name: string;
  link: string;
  imageUrl: string;
}

export class DeveloperListItemResDto {
  id: string;
  name: string;
  link: string;
  imageUrl: string;
}

export class ModelResDto {
  id: string;
  name: string;
  shortName: string;
  value: string;
  link: string;
  guestAccess: boolean;
  price: {
    input: number;
    output: number;
  };
  metadata: {
    contextWindow: number;
    maxOutputTokens: number;
    knowledgeCutoff: string;
  };
  developer: ModelDeveloperResDto;
  createdAt: Date;
  updatedAt: Date;
}

export class ModelListItemResDto {
  id: string;
  name: string;
  shortName: string;
  value: string;
  guestAccess: boolean;
  developer: {
    name: string;
    imageUrl: string;
  };
}
