export class ModelDeveloperResDto {
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
  developer: {
    name: string;
    imageUrl: string;
  };
}
