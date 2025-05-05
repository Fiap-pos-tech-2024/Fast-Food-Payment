import { OrderController } from '../../../src/drivers/web/orderController'
import { Order } from '../../../src/domain/entities/order'

const BASE_URL = process.env.ORDER_SERVICE_API
describe('OrderController', () => {
    let orderController: OrderController

    beforeAll(() => {
        orderController = new OrderController()
    })

    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getOrder', () => {
        it('should return an order when the API responds successfully', async () => {
            const mockOrder: Order = {
                idOrder: '1',
                value: 100,
                idClient: 'client123',
                cpf: '12345678900',
                name: 'John Doe',
                email: 'john.doe@example.com',
                items: [],
                status: 'PENDING',
                paymentId: '',
                paymentLink: '',
            }
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrder,
            })

            const result = await orderController.getOrder('1')

            expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/order/1`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
            expect(result).toEqual(mockOrder)
        })

        it('should throw an error when the API responds with a non-200 status', async () => {
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 404,
            })

            await expect(orderController.getOrder('1')).rejects.toThrow(
                'Failed to get order'
            )
            expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/order/1`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            })
        })

        it('should throw an error when the fetch request fails', async () => {
            ;(global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            )

            await expect(orderController.getOrder('1')).rejects.toThrow(
                'Failed to get order'
            )
        })
    })

    describe('updateOrder', () => {
        it('should update an order successfully', async () => {
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            })

            const mockOrder: Order = {
                idOrder: '1',
                value: 100,
                idClient: 'client123',
                cpf: '12345678900',
                name: 'John Doe',
                email: 'john.doe@example.com',
                items: [],
                status: 'PENDING',
                paymentId: '',
                paymentLink: '',
            }
            await orderController.updateOrder('1', mockOrder)

            expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/order/1`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockOrder),
            })
        })

        it('should throw an error when the API responds with a non-200 status', async () => {
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 500,
            })

            const mockOrder: Order = {
                idOrder: '1',
                value: 100,
                idClient: 'client123',
                cpf: '12345678900',
                name: 'John Doe',
                email: 'john.doe@example.com',
                items: [],
                status: 'PENDING',
                paymentId: '',
                paymentLink: '',
            }
            await expect(
                orderController.updateOrder('1', mockOrder)
            ).rejects.toThrow('Failed to update order')
        })

        it('should throw an error when the fetch request fails', async () => {
            ;(global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            )

            const mockOrder: Order = {
                idOrder: '1',
                value: 100,
                idClient: 'client123',
                cpf: '12345678900',
                name: 'John Doe',
                email: 'john.doe@example.com',
                items: [],
                status: 'PENDING',
                paymentId: '',
                paymentLink: '',
            }
            await expect(
                orderController.updateOrder('1', mockOrder)
            ).rejects.toThrow('Failed to update order')
        })
    })

    describe('updateOrderStatus', () => {
        it('should update the order status successfully', async () => {
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
            })

            await orderController.updateOrderStatus('1', 'COMPLETED')

            expect(global.fetch).toHaveBeenCalledWith(
                `${BASE_URL}/order/1/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'COMPLETED' }),
                }
            )
        })

        it('should throw an error when the API responds with a non-200 status', async () => {
            ;(global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 400,
            })

            await expect(
                orderController.updateOrderStatus('1', 'INVALID')
            ).rejects.toThrow('Failed to update order status')
        })

        it('should throw an error when the fetch request fails', async () => {
            ;(global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error('Network error')
            )

            await expect(
                orderController.updateOrderStatus('1', 'COMPLETED')
            ).rejects.toThrow('Failed to update order status')
        })
    })
})
