
export interface Sweet {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Section {
  id: string;
  title: string;
  items: Sweet[];
  imageUrl?: string; // Foto de capa da categoria
  isGallery?: boolean; // Define se a seção é apenas para exposição
}

export interface CartItem extends Sweet {
  quantity: number;
}
