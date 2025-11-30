import { Database } from './database';

/**
 * Default trivia questions collection
 */
const DEFAULT_TRIVIA_QUESTIONS = [
  // Science (15 questions)
  { id: 'trivia_1', question: 'What is the chemical symbol for gold?', answer: 'Au', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_2', question: 'What is the largest planet in our solar system?', answer: 'Jupiter', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_3', question: 'What is the speed of light?', answer: '299,792,458 meters per second', category: 'Science', difficulty: 'Hard' },
  { id: 'trivia_4', question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_5', question: 'How many bones are in the human body?', answer: '206', category: 'Science', difficulty: 'Medium' },
  { id: 'trivia_6', question: 'What is the chemical symbol for oxygen?', answer: 'O', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_7', question: 'What is the smallest unit of life?', answer: 'Cell', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_8', question: 'How many chambers does a human heart have?', answer: '4', category: 'Science', difficulty: 'Medium' },
  { id: 'trivia_9', question: 'What gas do plants absorb from the atmosphere?', answer: 'Carbon dioxide', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_10', question: 'What is the boiling point of water in Celsius?', answer: '100', category: 'Science', difficulty: 'Easy' },
  { id: 'trivia_11', question: 'What is the most abundant element in the universe?', answer: 'Hydrogen', category: 'Science', difficulty: 'Medium' },
  { id: 'trivia_12', question: 'How many sides does a DNA molecule have?', answer: '2', category: 'Science', difficulty: 'Hard' },
  { id: 'trivia_13', question: 'What is the study of rocks called?', answer: 'Geology', category: 'Science', difficulty: 'Medium' },
  { id: 'trivia_14', question: 'What is the largest organ in the human body?', answer: 'Skin', category: 'Science', difficulty: 'Medium' },
  { id: 'trivia_15', question: 'How many chromosomes do humans have?', answer: '46', category: 'Science', difficulty: 'Hard' },

  // History (15 questions)
  { id: 'trivia_16', question: 'In what year did the Titanic sink?', answer: '1912', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_17', question: 'Who was the first President of the United States?', answer: 'George Washington', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_18', question: 'What year did World War II end?', answer: '1945', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_19', question: 'Who wrote the Declaration of Independence?', answer: 'Thomas Jefferson', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_20', question: 'In what year did the Berlin Wall fall?', answer: '1989', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_21', question: 'Who was the first Emperor of Rome?', answer: 'Augustus', category: 'History', difficulty: 'Hard' },
  { id: 'trivia_22', question: 'In what year did the American Revolution begin?', answer: '1775', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_23', question: 'Who was the first person to walk on the moon?', answer: 'Neil Armstrong', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_24', question: 'What year did the Titanic sink?', answer: '1912', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_25', question: 'Who was the first King of England?', answer: 'William the Conqueror', category: 'History', difficulty: 'Hard' },
  { id: 'trivia_26', question: 'In what year did the French Revolution begin?', answer: '1789', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_27', question: 'Who was the first President of South Africa?', answer: 'Nelson Mandela', category: 'History', difficulty: 'Medium' },
  { id: 'trivia_28', question: 'What year did the Great Fire of London occur?', answer: '1666', category: 'History', difficulty: 'Hard' },
  { id: 'trivia_29', question: 'Who discovered America?', answer: 'Christopher Columbus', category: 'History', difficulty: 'Easy' },
  { id: 'trivia_30', question: 'In what year did the Soviet Union collapse?', answer: '1991', category: 'History', difficulty: 'Medium' },

  // Geography (15 questions)
  { id: 'trivia_31', question: 'What is the capital of France?', answer: 'Paris', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_32', question: 'What is the largest country by area?', answer: 'Russia', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_33', question: 'What is the capital of Japan?', answer: 'Tokyo', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_34', question: 'How many continents are there?', answer: '7', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_35', question: 'What is the longest river in the world?', answer: 'The Nile River', category: 'Geography', difficulty: 'Medium' },
  { id: 'trivia_36', question: 'What is the capital of Australia?', answer: 'Canberra', category: 'Geography', difficulty: 'Medium' },
  { id: 'trivia_37', question: 'What is the smallest country in the world?', answer: 'Vatican City', category: 'Geography', difficulty: 'Medium' },
  { id: 'trivia_38', question: 'What is the capital of Brazil?', answer: 'Brasília', category: 'Geography', difficulty: 'Medium' },
  { id: 'trivia_39', question: 'What is the highest mountain in the world?', answer: 'Mount Everest', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_40', question: 'What is the capital of Egypt?', answer: 'Cairo', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_41', question: 'How many oceans are there?', answer: '5', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_42', question: 'What is the capital of Canada?', answer: 'Ottawa', category: 'Geography', difficulty: 'Medium' },
  { id: 'trivia_43', question: 'What is the largest desert in the world?', answer: 'Antarctica', category: 'Geography', difficulty: 'Hard' },
  { id: 'trivia_44', question: 'What is the capital of India?', answer: 'New Delhi', category: 'Geography', difficulty: 'Easy' },
  { id: 'trivia_45', question: 'What is the deepest ocean trench?', answer: 'Mariana Trench', category: 'Geography', difficulty: 'Hard' },

  // Literature (15 questions)
  { id: 'trivia_46', question: 'Who wrote Romeo and Juliet?', answer: 'William Shakespeare', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_47', question: 'Who wrote 1984?', answer: 'George Orwell', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_48', question: 'Who wrote Pride and Prejudice?', answer: 'Jane Austen', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_49', question: 'Who wrote The Great Gatsby?', answer: 'F. Scott Fitzgerald', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_50', question: 'How many books are in the Harry Potter series?', answer: '7', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_51', question: 'Who wrote To Kill a Mockingbird?', answer: 'Harper Lee', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_52', question: 'Who wrote The Catcher in the Rye?', answer: 'J.D. Salinger', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_53', question: 'Who wrote Moby Dick?', answer: 'Herman Melville', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_54', question: 'Who wrote Jane Eyre?', answer: 'Charlotte Brontë', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_55', question: 'Who wrote The Lord of the Rings?', answer: 'J.R.R. Tolkien', category: 'Literature', difficulty: 'Easy' },
  { id: 'trivia_56', question: 'Who wrote Wuthering Heights?', answer: 'Emily Brontë', category: 'Literature', difficulty: 'Hard' },
  { id: 'trivia_57', question: 'Who wrote The Odyssey?', answer: 'Homer', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_58', question: 'Who wrote Frankenstein?', answer: 'Mary Shelley', category: 'Literature', difficulty: 'Medium' },
  { id: 'trivia_59', question: 'Who wrote The Picture of Dorian Gray?', answer: 'Oscar Wilde', category: 'Literature', difficulty: 'Hard' },
  { id: 'trivia_60', question: 'Who wrote Crime and Punishment?', answer: 'Fyodor Dostoevsky', category: 'Literature', difficulty: 'Hard' },

  // Sports (15 questions)
  { id: 'trivia_61', question: 'How many players are on a basketball team on the court?', answer: '5', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_62', question: 'How many innings are in a baseball game?', answer: '9', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_63', question: 'What is the maximum score in a single frame of bowling?', answer: '300', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_64', question: 'How many holes are on a standard golf course?', answer: '18', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_65', question: 'In tennis, what is a score of zero called?', answer: 'Love', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_66', question: 'How many players are on a soccer team on the field?', answer: '11', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_67', question: 'How many sets are in a tennis match?', answer: '3', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_68', question: 'What is the height of a basketball hoop?', answer: '10 feet', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_69', question: 'How many players are on an American football team on the field?', answer: '11', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_70', question: 'What is the length of an Olympic swimming pool?', answer: '50 meters', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_71', question: 'How many points is a touchdown worth in American football?', answer: '6', category: 'Sports', difficulty: 'Easy' },
  { id: 'trivia_72', question: 'What is the diameter of a basketball?', answer: '9.43 inches', category: 'Sports', difficulty: 'Hard' },
  { id: 'trivia_73', question: 'How many players are on a hockey team on the ice?', answer: '6', category: 'Sports', difficulty: 'Medium' },
  { id: 'trivia_74', question: 'What is the weight of a baseball?', answer: '5.125 ounces', category: 'Sports', difficulty: 'Hard' },
  { id: 'trivia_75', question: 'How many rounds are in a professional boxing match?', answer: '12', category: 'Sports', difficulty: 'Medium' },
];

/**
 * Default word and phrase collection for the game
 */
const DEFAULT_ITEMS = [
  // Movies (20 items)
  { id: 'movie_1', text: 'The Shawshank Redemption', category: 'Movies' },
  { id: 'movie_2', text: 'Inception', category: 'Movies' },
  { id: 'movie_3', text: 'The Dark Knight', category: 'Movies' },
  { id: 'movie_4', text: 'Pulp Fiction', category: 'Movies' },
  { id: 'movie_5', text: 'Forrest Gump', category: 'Movies' },
  { id: 'movie_6', text: 'The Matrix', category: 'Movies' },
  { id: 'movie_7', text: 'Titanic', category: 'Movies' },
  { id: 'movie_8', text: 'Avatar', category: 'Movies' },
  { id: 'movie_9', text: 'Interstellar', category: 'Movies' },
  { id: 'movie_10', text: 'The Avengers', category: 'Movies' },
  { id: 'movie_11', text: 'Jurassic Park', category: 'Movies' },
  { id: 'movie_12', text: 'The Lion King', category: 'Movies' },
  { id: 'movie_13', text: 'Frozen', category: 'Movies' },
  { id: 'movie_14', text: 'Toy Story', category: 'Movies' },
  { id: 'movie_15', text: 'Back to the Future', category: 'Movies' },
  { id: 'movie_16', text: 'Gladiator', category: 'Movies' },
  { id: 'movie_17', text: 'The Godfather', category: 'Movies' },
  { id: 'movie_18', text: 'Jaws', category: 'Movies' },
  { id: 'movie_19', text: 'E.T.', category: 'Movies' },
  { id: 'movie_20', text: 'Casablanca', category: 'Movies' },

  // TV Shows (20 items)
  { id: 'tv_1', text: 'Breaking Bad', category: 'TV Shows' },
  { id: 'tv_2', text: 'Game of Thrones', category: 'TV Shows' },
  { id: 'tv_3', text: 'The Office', category: 'TV Shows' },
  { id: 'tv_4', text: 'Friends', category: 'TV Shows' },
  { id: 'tv_5', text: 'Stranger Things', category: 'TV Shows' },
  { id: 'tv_6', text: 'The Crown', category: 'TV Shows' },
  { id: 'tv_7', text: 'The Mandalorian', category: 'TV Shows' },
  { id: 'tv_8', text: 'Sherlock', category: 'TV Shows' },
  { id: 'tv_9', text: 'The Witcher', category: 'TV Shows' },
  { id: 'tv_10', text: 'Westworld', category: 'TV Shows' },
  { id: 'tv_11', text: 'Chernobyl', category: 'TV Shows' },
  { id: 'tv_12', text: 'The Last of Us', category: 'TV Shows' },
  { id: 'tv_13', text: 'Succession', category: 'TV Shows' },
  { id: 'tv_14', text: 'The Boys', category: 'TV Shows' },
  { id: 'tv_15', text: 'Ozark', category: 'TV Shows' },
  { id: 'tv_16', text: 'Peaky Blinders', category: 'TV Shows' },
  { id: 'tv_17', text: 'The Sopranos', category: 'TV Shows' },
  { id: 'tv_18', text: 'Mad Men', category: 'TV Shows' },
  { id: 'tv_19', text: 'Better Call Saul', category: 'TV Shows' },
  { id: 'tv_20', text: 'The Handmaid\'s Tale', category: 'TV Shows' },

  // Animals (20 items)
  { id: 'animal_1', text: 'Lion', category: 'Animals' },
  { id: 'animal_2', text: 'Elephant', category: 'Animals' },
  { id: 'animal_3', text: 'Penguin', category: 'Animals' },
  { id: 'animal_4', text: 'Dolphin', category: 'Animals' },
  { id: 'animal_5', text: 'Giraffe', category: 'Animals' },
  { id: 'animal_6', text: 'Octopus', category: 'Animals' },
  { id: 'animal_7', text: 'Tiger', category: 'Animals' },
  { id: 'animal_8', text: 'Kangaroo', category: 'Animals' },
  { id: 'animal_9', text: 'Panda', category: 'Animals' },
  { id: 'animal_10', text: 'Eagle', category: 'Animals' },
  { id: 'animal_11', text: 'Shark', category: 'Animals' },
  { id: 'animal_12', text: 'Cheetah', category: 'Animals' },
  { id: 'animal_13', text: 'Koala', category: 'Animals' },
  { id: 'animal_14', text: 'Zebra', category: 'Animals' },
  { id: 'animal_15', text: 'Butterfly', category: 'Animals' },
  { id: 'animal_16', text: 'Crocodile', category: 'Animals' },
  { id: 'animal_17', text: 'Peacock', category: 'Animals' },
  { id: 'animal_18', text: 'Sloth', category: 'Animals' },
  { id: 'animal_19', text: 'Flamingo', category: 'Animals' },
  { id: 'animal_20', text: 'Hedgehog', category: 'Animals' },

  // Sports (20 items)
  { id: 'sport_1', text: 'Basketball', category: 'Sports' },
  { id: 'sport_2', text: 'Soccer', category: 'Sports' },
  { id: 'sport_3', text: 'Tennis', category: 'Sports' },
  { id: 'sport_4', text: 'Swimming', category: 'Sports' },
  { id: 'sport_5', text: 'Golf', category: 'Sports' },
  { id: 'sport_6', text: 'Volleyball', category: 'Sports' },
  { id: 'sport_7', text: 'Baseball', category: 'Sports' },
  { id: 'sport_8', text: 'American Football', category: 'Sports' },
  { id: 'sport_9', text: 'Ice Hockey', category: 'Sports' },
  { id: 'sport_10', text: 'Rugby', category: 'Sports' },
  { id: 'sport_11', text: 'Boxing', category: 'Sports' },
  { id: 'sport_12', text: 'Gymnastics', category: 'Sports' },
  { id: 'sport_13', text: 'Skiing', category: 'Sports' },
  { id: 'sport_14', text: 'Surfing', category: 'Sports' },
  { id: 'sport_15', text: 'Skateboarding', category: 'Sports' },
  { id: 'sport_16', text: 'Cycling', category: 'Sports' },
  { id: 'sport_17', text: 'Archery', category: 'Sports' },
  { id: 'sport_18', text: 'Badminton', category: 'Sports' },
  { id: 'sport_19', text: 'Bowling', category: 'Sports' },
  { id: 'sport_20', text: 'Martial Arts', category: 'Sports' },

  // Professions (20 items)
  { id: 'prof_1', text: 'Doctor', category: 'Professions' },
  { id: 'prof_2', text: 'Teacher', category: 'Professions' },
  { id: 'prof_3', text: 'Engineer', category: 'Professions' },
  { id: 'prof_4', text: 'Chef', category: 'Professions' },
  { id: 'prof_5', text: 'Pilot', category: 'Professions' },
  { id: 'prof_6', text: 'Astronaut', category: 'Professions' },
  { id: 'prof_7', text: 'Lawyer', category: 'Professions' },
  { id: 'prof_8', text: 'Architect', category: 'Professions' },
  { id: 'prof_9', text: 'Musician', category: 'Professions' },
  { id: 'prof_10', text: 'Actor', category: 'Professions' },
  { id: 'prof_11', text: 'Photographer', category: 'Professions' },
  { id: 'prof_12', text: 'Journalist', category: 'Professions' },
  { id: 'prof_13', text: 'Scientist', category: 'Professions' },
  { id: 'prof_14', text: 'Firefighter', category: 'Professions' },
  { id: 'prof_15', text: 'Police Officer', category: 'Professions' },
  { id: 'prof_16', text: 'Nurse', category: 'Professions' },
  { id: 'prof_17', text: 'Farmer', category: 'Professions' },
  { id: 'prof_18', text: 'Mechanic', category: 'Professions' },
  { id: 'prof_19', text: 'Electrician', category: 'Professions' },
  { id: 'prof_20', text: 'Plumber', category: 'Professions' },

  // Common Phrases (20 items)
  { id: 'phrase_1', text: 'Break a leg', category: 'Phrases' },
  { id: 'phrase_2', text: 'Piece of cake', category: 'Phrases' },
  { id: 'phrase_3', text: 'Raining cats and dogs', category: 'Phrases' },
  { id: 'phrase_4', text: 'Hit the hay', category: 'Phrases' },
  { id: 'phrase_5', text: 'Spill the beans', category: 'Phrases' },
  { id: 'phrase_6', text: 'Under the weather', category: 'Phrases' },
  { id: 'phrase_7', text: 'Bite the bullet', category: 'Phrases' },
  { id: 'phrase_8', text: 'Burning the midnight oil', category: 'Phrases' },
  { id: 'phrase_9', text: 'Call it a day', category: 'Phrases' },
  { id: 'phrase_10', text: 'Caught red-handed', category: 'Phrases' },
  { id: 'phrase_11', text: 'Cost an arm and a leg', category: 'Phrases' },
  { id: 'phrase_12', text: 'Cut to the chase', category: 'Phrases' },
  { id: 'phrase_13', text: 'Dead as a doornail', category: 'Phrases' },
  { id: 'phrase_14', text: 'Devil\'s advocate', category: 'Phrases' },
  { id: 'phrase_15', text: 'Dime a dozen', category: 'Phrases' },
  { id: 'phrase_16', text: 'Don\'t count your chickens', category: 'Phrases' },
  { id: 'phrase_17', text: 'Down to earth', category: 'Phrases' },
  { id: 'phrase_18', text: 'Easier said than done', category: 'Phrases' },
  { id: 'phrase_19', text: 'Easy as pie', category: 'Phrases' },
  { id: 'phrase_20', text: 'Eat your heart out', category: 'Phrases' },

  // Celebrities (15 items)
  { id: 'celeb_1', text: 'Taylor Swift', category: 'Celebrities' },
  { id: 'celeb_2', text: 'Elon Musk', category: 'Celebrities' },
  { id: 'celeb_3', text: 'Oprah Winfrey', category: 'Celebrities' },
  { id: 'celeb_4', text: 'Dwayne Johnson', category: 'Celebrities' },
  { id: 'celeb_5', text: 'Beyoncé', category: 'Celebrities' },
  { id: 'celeb_6', text: 'Tom Hanks', category: 'Celebrities' },
  { id: 'celeb_7', text: 'Meryl Streep', category: 'Celebrities' },
  { id: 'celeb_8', text: 'Leonardo DiCaprio', category: 'Celebrities' },
  { id: 'celeb_9', text: 'Scarlett Johansson', category: 'Celebrities' },
  { id: 'celeb_10', text: 'Will Smith', category: 'Celebrities' },
  { id: 'celeb_11', text: 'Jennifer Aniston', category: 'Celebrities' },
  { id: 'celeb_12', text: 'Brad Pitt', category: 'Celebrities' },
  { id: 'celeb_13', text: 'Angelina Jolie', category: 'Celebrities' },
  { id: 'celeb_14', text: 'Johnny Depp', category: 'Celebrities' },
  { id: 'celeb_15', text: 'Keanu Reeves', category: 'Celebrities' },

  // Food & Drinks (15 items)
  { id: 'food_1', text: 'Pizza', category: 'Food & Drinks' },
  { id: 'food_2', text: 'Sushi', category: 'Food & Drinks' },
  { id: 'food_3', text: 'Hamburger', category: 'Food & Drinks' },
  { id: 'food_4', text: 'Tacos', category: 'Food & Drinks' },
  { id: 'food_5', text: 'Pasta', category: 'Food & Drinks' },
  { id: 'food_6', text: 'Steak', category: 'Food & Drinks' },
  { id: 'food_7', text: 'Chocolate', category: 'Food & Drinks' },
  { id: 'food_8', text: 'Ice Cream', category: 'Food & Drinks' },
  { id: 'food_9', text: 'Coffee', category: 'Food & Drinks' },
  { id: 'food_10', text: 'Tea', category: 'Food & Drinks' },
  { id: 'food_11', text: 'Soda', category: 'Food & Drinks' },
  { id: 'food_12', text: 'Beer', category: 'Food & Drinks' },
  { id: 'food_13', text: 'Wine', category: 'Food & Drinks' },
  { id: 'food_14', text: 'Donut', category: 'Food & Drinks' },
  { id: 'food_15', text: 'Sandwich', category: 'Food & Drinks' },

  // Countries (15 items)
  { id: 'country_1', text: 'France', category: 'Countries' },
  { id: 'country_2', text: 'Japan', category: 'Countries' },
  { id: 'country_3', text: 'Brazil', category: 'Countries' },
  { id: 'country_4', text: 'Germany', category: 'Countries' },
  { id: 'country_5', text: 'Italy', category: 'Countries' },
  { id: 'country_6', text: 'Spain', category: 'Countries' },
  { id: 'country_7', text: 'Mexico', category: 'Countries' },
  { id: 'country_8', text: 'Canada', category: 'Countries' },
  { id: 'country_9', text: 'Australia', category: 'Countries' },
  { id: 'country_10', text: 'India', category: 'Countries' },
  { id: 'country_11', text: 'China', category: 'Countries' },
  { id: 'country_12', text: 'Russia', category: 'Countries' },
  { id: 'country_13', text: 'Egypt', category: 'Countries' },
  { id: 'country_14', text: 'Greece', category: 'Countries' },
  { id: 'country_15', text: 'Thailand', category: 'Countries' },
];

/**
 * Seed the database with default items and trivia questions
 */
export async function seedDatabase(): Promise<void> {
  try {
    const db = Database.getInstance();
    
    // Check if items already exist
    const itemResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM items');
    const itemCount = itemResult ? (itemResult as any).count : 0;

    // Check if trivia questions already exist
    const triviaResult = await db.getFirstAsync('SELECT COUNT(*) as count FROM trivia_questions');
    const triviaCount = triviaResult ? (triviaResult as any).count : 0;

    if (itemCount > 0 && triviaCount > 0) {
      console.log(`Database already seeded with ${itemCount} items and ${triviaCount} trivia questions`);
      return;
    }

    // Insert default items if not already present
    if (itemCount === 0) {
      for (const item of DEFAULT_ITEMS) {
        await db.runAsync(
          'INSERT INTO items (id, text, category) VALUES (?, ?, ?)',
          [item.id, item.text, item.category]
        );
      }
      console.log(`Successfully seeded database with ${DEFAULT_ITEMS.length} items`);
    }

    // Insert default trivia questions if not already present
    if (triviaCount === 0) {
      for (const question of DEFAULT_TRIVIA_QUESTIONS) {
        await db.runAsync(
          'INSERT INTO trivia_questions (id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
          [question.id, question.question, question.answer, question.category, question.difficulty]
        );
      }
      console.log(`Successfully seeded database with ${DEFAULT_TRIVIA_QUESTIONS.length} trivia questions`);
    }
  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

/**
 * Add custom items to the database
 */
export async function addItems(
  items: Array<{ id: string; text: string; category?: string }>
): Promise<void> {
  try {
    const db = Database.getInstance();
    
    for (const item of items) {
      await db.runAsync(
        'INSERT OR REPLACE INTO items (id, text, category) VALUES (?, ?, ?)',
        [item.id, item.text, item.category || '']
      );
    }
    console.log(`Added ${items.length} items to database`);
  } catch (error) {
    console.error('Failed to add items:', error);
    throw error;
  }
}

/**
 * Clear all items from the database
 */
export async function clearItems(): Promise<void> {
  try {
    const db = Database.getInstance();
    await db.runAsync('DELETE FROM items');
    console.log('All items cleared from database');
  } catch (error) {
    console.error('Failed to clear items:', error);
    throw error;
  }
}

/**
 * Add custom trivia questions to the database
 */
export async function addTriviaQuestions(
  questions: Array<{ id: string; question: string; answer: string; category?: string; difficulty?: string }>
): Promise<void> {
  try {
    const db = Database.getInstance();
    
    for (const question of questions) {
      await db.runAsync(
        'INSERT OR REPLACE INTO trivia_questions (id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
        [question.id, question.question, question.answer, question.category || '', question.difficulty || '']
      );
    }
    console.log(`Added ${questions.length} trivia questions to database`);
  } catch (error) {
    console.error('Failed to add trivia questions:', error);
    throw error;
  }
}

/**
 * Clear all trivia questions from the database
 */
export async function clearTriviaQuestions(): Promise<void> {
  try {
    const db = Database.getInstance();
    await db.runAsync('DELETE FROM trivia_questions');
    console.log('All trivia questions cleared from database');
  } catch (error) {
    console.error('Failed to clear trivia questions:', error);
    throw error;
  }
}
