import { Order } from '../../src/domain/entities/order'

export const mockOrder: Order = {
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
