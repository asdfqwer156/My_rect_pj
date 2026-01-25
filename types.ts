export interface Category {
  id: string;
  name: string;
}

export interface Website {
  id: string;
  url: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
}