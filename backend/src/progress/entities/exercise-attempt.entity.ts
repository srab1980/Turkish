import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../lessons/entities/exercise.entity';

@Entity('exercise_attempts')
export class ExerciseAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'exercise_id' })
  exerciseId: string;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @ManyToOne(() => User, (user) => user.exerciseAttempts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  // TODO: Complete exercise attempt entity implementation
}
