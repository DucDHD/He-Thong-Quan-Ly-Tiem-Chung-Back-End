import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('vaccination_locations')
export class VaccinationLocation {
  @PrimaryGeneratedColumn({ name: 'location_id' })
  location_id: number;

  @Column({ name: 'location_name', type: 'nvarchar', length: 255 })
  locationName: string;

  @Column({name: 'address',  type: 'nvarchar', length: 500})
  address: string;
}