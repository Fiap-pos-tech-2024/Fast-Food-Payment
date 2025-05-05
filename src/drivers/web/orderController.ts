import { Order } from '../../domain/entities/order'
import { OrderService } from '../../domain/interface/orderService'

const BASE_URL = process.env.ORDER_SERVICE_API

if (!BASE_URL) {
    throw new Error('ORDER_SERVICE_API is not defined in environment variables')
}

export class OrderController implements OrderService {
    async getOrder(idOrder: string): Promise<Order | null> {
        try {
            const response = await fetch(`${BASE_URL}/order/${idOrder}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            if (!response.ok) {
                console.error(`Failed to get order: ${response.status}`)
                throw new Error(`Failed to get order: ${response.status}`)
            }

            return (await response.json()) as Order | null
        } catch (error) {
            console.error('Failed to get order:', error)
            throw new Error('Failed to get order')
        }
    }

    async updateOrder(id: string, order: Order): Promise<void> {
        try {
            const response = await fetch(`${BASE_URL}/order/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
            })
            if (!response.ok) {
                console.error(`Failed to update order: ${response.status}`)
                throw new Error(`Failed to update order: ${response.status}`)
            }
        } catch (error) {
            console.error('Failed to update order:', error)
            throw new Error('Failed to update order')
        }
    }

    async updateOrderStatus(id: string, status: string): Promise<void> {
        try {
            const response = await fetch(`${BASE_URL}/order/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            })
            if (!response.ok) {
                console.error(
                    `Failed to update order status: ${response.status}`
                )
                throw new Error(
                    `Failed to update order status: ${response.status}`
                )
            }
        } catch (error) {
            console.error('Failed to update order status:', error)
            throw new Error('Failed to update order status')
        }
    }
}
