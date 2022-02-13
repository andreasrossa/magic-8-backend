import { Test, TestingModule } from '@nestjs/testing';
import { DeviceBridgeGateway } from './device-bridge.gateway';

describe('DeviceBridgeGateway', () => {
  let gateway: DeviceBridgeGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceBridgeGateway],
    }).compile();

    gateway = module.get<DeviceBridgeGateway>(DeviceBridgeGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
