
export interface Asset {
    id?: string,
    maxPrice: number,
    title: string,
    userId: string,
    image?: string
}

export interface Order {
    qyt: number,
    price: number,
    type: string,
    userId: string,
    id?: string,
}