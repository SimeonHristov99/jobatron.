export interface Course {
    id: string
    rating: number
    title: string
    description: string
    organization: string
    level: string
    price: number
    duration: number

    status?: string
}