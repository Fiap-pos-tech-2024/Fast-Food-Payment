import { HealthCheckController } from '../../../src/drivers/web/healthCheckController'
import { HealthCheckUseCase } from '../../../src/useCases/healthCheck'
import { Request, Response } from 'express'
import { mockedHealthCheck } from '../../mock/healthCheckMock'

describe('HealthCheckController', () => {
    let healthCheckController: HealthCheckController
    let healthCheckUseCase: HealthCheckUseCase
    let req: Partial<Request>
    let res: Partial<Response>

    beforeEach(() => {
        healthCheckUseCase = new HealthCheckUseCase()
        healthCheckController = new HealthCheckController(healthCheckUseCase)
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
    })

    it('should return health check status', () => {
        healthCheckController['healthCheck'](req as Request, res as Response)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(mockedHealthCheck)
    })

    describe('Order Health Check', () => {
        it('should return order health status when orderHealthCheck succeeds', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ status: 'OK' }),
            })

            await healthCheckController.orderHealthCheck(
                req as Request,
                res as Response
            )

            expect(global.fetch).toHaveBeenCalledWith(
                'http://order-service:3001/health',
                expect.any(Object)
            )
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith({ status: 'OK' })
        })

        it('should return 500 if orderHealthCheck fails', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
            })

            await healthCheckController.orderHealthCheck(
                req as Request,
                res as Response
            )

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to check order health',
            })
        })

        it('should return 500 if orderHealthCheck throws', async () => {
            global.fetch = jest
                .fn()
                .mockRejectedValue(new Error('Network error'))

            await healthCheckController.orderHealthCheck(
                req as Request,
                res as Response
            )

            expect(res.status).toHaveBeenCalledWith(500)
            expect(res.json).toHaveBeenCalledWith({
                error: 'Failed to check order health',
            })
        })
    })
})
