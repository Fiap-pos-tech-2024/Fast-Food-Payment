import { Order } from '../entities/order'

export interface OrderService {
    getOrder(idOrder: string): Promise<Order | null>
    updateOrder(id: string, order: Order): Promise<void>
    updateOrderStatus(id: string, status: string): Promise<void>
}
