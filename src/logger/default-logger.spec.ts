import { DefaultLogger } from './default-logger';

describe('DefaultLogger', () => {
  it('should be defined', () => {
    expect(new DefaultLogger()).toBeDefined();
  });
});
