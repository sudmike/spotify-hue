export class Light {
  public id: number;
  public name: string;
  public reachable: boolean;
  public active: boolean;

  constructor(Id: number, Name: string = '', Reachable: boolean = false, Active: boolean = false) {
    this.id = Id;
    this.name = Name;
    this.reachable = Reachable;
    this.active = Active;
  }
}
