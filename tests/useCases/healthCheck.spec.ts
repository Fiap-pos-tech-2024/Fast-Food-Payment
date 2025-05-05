import { HealthCheckUseCase } from '../../src/useCases/healthCheck'
import { mockedHealthCheck } from '../mock/healthCheckMock'

describe('HealthCheckService', () => {
    let healthCheckService: HealthCheckUseCase

    beforeEach(() => {
        healthCheckService = new HealthCheckUseCase()
    })

    it('should return "Health Check"', () => {
        const result = healthCheckService.healthCheck()

        expect(result).toEqual(mockedHealthCheck)
    })
})
