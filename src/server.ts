import express from 'express'
import { HealthCheckController } from './drivers/web/healthCheckController'
import { MongoConnection } from './config/mongoConfig'
import swaggerRouter from './config/swaggerConfig'
import { HealthCheckUseCase } from './useCases/healthCheck'
import { MongoPaymentRepository } from './drivers/database/paymentModel'
import { PaymentUseCase } from './useCases/payment'
import { PaymentController } from './drivers/web/paymentController'
import { MercadoPagoController } from './drivers/web/mercadoPagoController'
import { OrderController } from './drivers/web/orderController'

class InitProject {
    public express: express.Application
    public mongoConnection: MongoConnection

    constructor() {
        this.express = express()
        this.mongoConnection = MongoConnection.getInstance()
    }

    async start() {
        try {
            await this.mongoConnection.connect()
            this.express.use(express.json())
            this.setupRoutes()
            this.startServer()
        } catch (error) {
            console.error('Failed to start application:', error)
        }
    }

    setupRoutes() {
        // Configuração do Order
        const orderController = new OrderController()

        // Configuração do MercadoPagoController
        const mercadoPagoController = new MercadoPagoController()

        // Configuração do Pagamento
        const paymentRepository = new MongoPaymentRepository(
            this.mongoConnection
        )

        // Agora passando o `mercadoPagoController` para o `PaymentUseCase`
        const paymentUseCase = new PaymentUseCase(
            paymentRepository,
            orderController,
            mercadoPagoController
        )

        const paymentController = new PaymentController(paymentUseCase)
        this.express.use('/payment', paymentController.setupRoutes())

        // Configuração do Health Check e Swagger
        const healthCheckUseCase = new HealthCheckUseCase()
        const routesHealthCheckController = new HealthCheckController(
            healthCheckUseCase
        )
        this.express.use('/health', routesHealthCheckController.setupRoutes())
        this.express.use('/api-docs', swaggerRouter)
    }

    startServer() {
        this.express.listen(3000, () => {
            console.log('Server is running on port 3000')
        })
    }
}

const app = new InitProject()
app.start()
