import { PaymentRepository } from '../domain/interface/paymentRepository'
import { Payment } from '../domain/entities/payment'
import { MercadoPagoController } from '../drivers/web/mercadoPagoController'
import { OrderService } from '../domain/interface/orderService'
import { PAYMENT_STATUS } from '../constants/payment'
import { ORDER_STATUS } from '../constants/order'

export class PaymentUseCase {
    private readonly paymentRepository: PaymentRepository
    private readonly orderService: OrderService
    private readonly mercadoPagoController: MercadoPagoController

    constructor(
        paymentRepository: PaymentRepository,
        orderService: OrderService,
        mercadoPagoController: MercadoPagoController
    ) {
        this.orderService = orderService
        this.paymentRepository = paymentRepository
        this.mercadoPagoController = mercadoPagoController
    }

    async createPayment(payment: Payment): Promise<{ id: string }> {
        if (!payment.order.idOrder) {
            throw new Error('Order ID is required')
        }

        if (!payment.order.value) {
            throw new Error('Order value is required')
        }

        const existingOrder = await this.orderService.getOrder(
            payment.order.idOrder
        )
        if (!existingOrder) {
            throw new Error(
                `Order with ID ${payment.order.idOrder} does not exist`
            )
        }
        const accessData = await this.mercadoPagoController.getUserToken()

        if (!accessData?.token || !accessData?.userId) {
            throw new Error('Failed to fetch QR code token')
        }

        const qrCodeLink = (await this.mercadoPagoController.generateQRCodeLink(
            accessData,
            payment.order
        )) as { qr_data: string }

        const QRCodePaymentLink =
            await this.mercadoPagoController.convertQRCodeToImage(
                qrCodeLink.qr_data
            )

        const paymentCreated = await this.paymentRepository.createPayment({
            ...payment,
            paymentLink: QRCodePaymentLink,
            paymentId: payment.order.idOrder,
            status: PAYMENT_STATUS.AWAITING,
            total: payment.order.value,
        })

        await this.orderService.updateOrder(payment.order.idOrder, {
            ...payment.order,
            paymentLink: QRCodePaymentLink,
            paymentId: paymentCreated.id,
        })

        return paymentCreated
    }

    async getPayment(paymentId: string): Promise<Payment | null> {
        const payment = await this.paymentRepository.getPayment(paymentId)
        if (!payment) {
            throw new Error('Payment not found')
        }
        return payment
    }

    async handlePaymentWebhook(webhookData: {
        resource: string
        topic: string
    }): Promise<void> {
        if (webhookData.topic !== 'merchant_order') {
            console.warn('Invalid webhook topic:', webhookData.topic)
            return
        }

        const mercadoPagoData =
            await this.mercadoPagoController.getPaymentStatus(
                webhookData.resource
            )

        if (!mercadoPagoData?.id || !mercadoPagoData?.status) {
            throw new Error('Invalid MercadoPago data')
        }

        const paymentId = mercadoPagoData.id
        const paymentStatus = mercadoPagoData.status.toUpperCase()

        const payment = await this.paymentRepository.getPayment(paymentId)
        if (!payment) {
            throw new Error('Payment not found')
        }

        await this.paymentRepository.updatePaymentStatus(
            paymentId,
            paymentStatus
        )

        if (paymentStatus === PAYMENT_STATUS.PAID) {
            await this.orderService.updateOrderStatus(
                paymentId,
                ORDER_STATUS.RECEIVED
            )
        }
    }
}
