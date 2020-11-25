export class Track {
  public id: string;
  public name: string;
  public artists: string[];
  public imagePath: string[];
  public playing: boolean;
  public imageRgb: number[];
  public imageHsl: number[];

  constructor(Id: string = '', Name: string = '', Artists: string[] = [], ImagePath: string[] = [], Playing: boolean = false) {
    this.id = Id;
    this.name = Name;
    this.artists = Artists;
    this.imagePath = ImagePath;
    this.playing = Playing;
  }
}
