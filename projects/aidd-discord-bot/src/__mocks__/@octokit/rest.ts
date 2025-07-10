export class Octokit {
  rest: any;

  constructor() {
    this.rest = {
      git: {
        getRef: jest.fn(),
        createRef: jest.fn(),
      },
      pulls: {
        create: jest.fn(),
      },
    };
  }
}