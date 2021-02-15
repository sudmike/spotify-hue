class Session {
  private value: string;

  constructor(){
    this.value = '';
  }

  public get(): string {
    return this.value;
  }

  public active(): boolean {
    return (!
        (this.value === '' ||
          this.value === undefined ||
          this.value === null)
    );
  }

  public set(str: string): void {
    this.value = str;
  }
}

const session = new Session();
// Object.freeze(session);

export { session, Session };
