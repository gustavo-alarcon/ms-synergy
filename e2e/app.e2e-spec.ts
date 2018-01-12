import { MsSynergyPage } from './app.po';

describe('ms-synergy App', () => {
  let page: MsSynergyPage;

  beforeEach(() => {
    page = new MsSynergyPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
