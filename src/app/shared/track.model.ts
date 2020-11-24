export class Track {
  public id: string;
  public name: string;
  public imagePath: string;
  public playing: boolean;
  public imageRgb: number[];
  public imageHsl: number[];

  constructor(Id: string = '', Name: string = '', ImagePath: string = '', Playing: boolean = false) {
    this.name = Name;
    this.id = Id;
    this.imagePath = ImagePath;
    this.playing = Playing;
  }
}
