import { v4 as uuidv4 } from 'uuid';

export class Participant {
  id: string;
  name: string;
  image: string | null;
  createdAt: Date;

  constructor(name: string, image: string | null = null) {
    this.id = uuidv4();
    this.name = name;
    this.image = image;
    this.createdAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      image: this.image,
      createdAt: this.createdAt
    };
  }

  static fromJSON(data: any): Participant {
    const participant = new Participant(
      data.name,
      data.image
    );
    
    participant.id = data.id;
    participant.createdAt = new Date(data.createdAt);
    
    return participant;
  }
}