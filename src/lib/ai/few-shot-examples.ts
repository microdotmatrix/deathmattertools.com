/**
 * Few-Shot Example Storage for Obituary Generation
 * 
 * This module stores high-quality example obituaries used for few-shot prompting.
 * Examples teach the AI model the expected structure, tone, and style through
 * demonstration rather than abstract instruction.
 */

export interface ObituaryExample {
  id: string;
  name: string;
  tone: string; // "reverent", "celebratory", "contemporary", etc.
  style: string; // "traditional", "modern", "personal", etc.
  isReligious: boolean;
  hasQuotes: boolean;
  hasMilitaryService: boolean;
  facts: string; // Formatted fact string (user message)
  obituary: string; // Expected output (assistant message)
}

/**
 * High-quality example obituaries for few-shot learning
 */
export const fewShotExamples: ObituaryExample[] = [
  // Example 1: Traditional/Reverent Tone
  {
    id: "example-1-traditional-reverent",
    name: "Margaret Rose Thompson",
    tone: "reverent",
    style: "traditional",
    isReligious: false,
    hasQuotes: false,
    hasMilitaryService: false,
    facts: `Generate a traditional obituary for the following person, using a reverent tone:

Name: Margaret Rose Thompson

Date of Birth: March 15, 1942
Date of Death: October 28, 2024
Location of Birth: Charleston, South Carolina
Location of Death: Charleston, South Carolina
Cause of Death: Natural causes

Biographical Info:
Occupation: Elementary School Teacher
Years Worked: 40 years (1964-2004)
Education: Bachelor of Education, College of Charleston (1964)
Hobbies: Gardening, reading, volunteering at local food bank

Family Info:
Survived By: Husband of 58 years, Robert Thompson; 3 children - Susan Thompson, Mark Thompson, and Jennifer Thompson; 7 grandchildren

Additional Details:
Funeral Service(s): Memorial service November 2, 2024, 2:00 PM at Grace Community Church, Charleston, SC`,
    obituary: `# Margaret Rose Thompson

**March 15, 1942 - October 28, 2024**

Margaret Rose Thompson, beloved wife, mother, and devoted educator, passed away peacefully in her Charleston home on October 28, 2024, at the age of 82.

Born in Charleston, South Carolina, Margaret dedicated her life to nurturing young minds and cultivating beauty in the world around her. After earning her Bachelor of Education from the College of Charleston in 1964, she embarked on a remarkable 40-year career as an elementary school teacher, touching the lives of countless students who would remember her patience, kindness, and infectious enthusiasm for learning.

Beyond the classroom, Margaret found profound joy in her garden, where she created a sanctuary of flowers and vegetables that she generously shared with neighbors and friends. An avid reader, she was rarely seen without a book in hand, and her personal library was a testament to her curious and compassionate spirit. Her commitment to service extended to the local food bank, where she volunteered weekly, embodying the values of generosity and community care she held dear.

Margaret's greatest treasures were her family. She shared 58 wonderful years with her husband, Robert, building a life filled with love, laughter, and unwavering partnership. She was a devoted mother to Susan, Mark, and Jennifer, and a cherished grandmother to seven grandchildren who brought immeasurable joy to her life.

**Survived by:** Husband Robert Thompson; children Susan, Mark, and Jennifer; and 7 grandchildren.

**Memorial Service:** November 2, 2024, at 2:00 PM, Grace Community Church, Charleston, South Carolina.

Margaret's gentle spirit, generous heart, and dedication to making the world a better place will be deeply missed by all who knew her. Her legacy lives on in the lives she touched and the love she shared.`
  },

  // Example 2: Celebratory/Uplifting Tone with Military Service
  {
    id: "example-2-celebratory-military",
    name: "James \"Jim\" Patrick O'Connor",
    tone: "celebratory",
    style: "modern",
    isReligious: false,
    hasQuotes: false,
    hasMilitaryService: true,
    facts: `Generate a modern obituary for the following person, using a celebratory tone:

Name: James "Jim" Patrick O'Connor

Date of Birth: July 4, 1951
Date of Death: November 5, 2024
Location of Birth: Boston, Massachusetts
Location of Death: San Diego, California
Cause of Death: Natural causes

Biographical Info:
Occupation: Commercial Airline Pilot
Years Worked: 25 years (1994-2019)
Hobbies: Deep sea fishing, coaching youth baseball, storytelling
Interests: Aviation history, Irish folk music

Military Service:
Military Branch: U.S. Navy
Military Rank: Lieutenant Commander
Military Years Served: 20 years (1973-1993)

Family Info:
Survived By: Wife of 45 years, Patricia O'Connor; son Michael O'Connor (wife Amanda); daughter Kathleen (husband David); 4 grandchildren

Additional Details:
Donation Requests: In lieu of flowers, donations to the Navy-Marine Corps Relief Society`,
    obituary: `# James "Jim" Patrick O'Connor

**July 4, 1951 - November 5, 2024**

Jim O'Connor—patriot, pilot, coach, and the best storyteller you'd ever meet—took his final flight on November 5, 2024, in San Diego, California, at the age of 73.

Born on Independence Day in Boston, Massachusetts, Jim seemed destined for a life of service and adventure. After answering the call to serve his country, he spent 20 distinguished years in the U.S. Navy, rising to the rank of Lieutenant Commander. His military career took him across oceans and around the world, experiences that would later fuel the legendary stories he loved to share.

Following his honorable discharge in 1993, Jim continued to soar—this time as a commercial airline pilot for 25 years. His calm demeanor and expert skill gave thousands of passengers safe passage to their destinations, though he always joked that landing a plane was easier than coaching Little League.

And coach he did. For over two decades, Jim volunteered his time mentoring young baseball players, teaching them not just how to hit a curveball, but the values of teamwork, perseverance, and good sportsmanship. When he wasn't on the diamond or out on the deep blue sea fishing for marlin, you could find him immersed in aviation history books or filling the house with the sounds of Irish folk music—a nod to his proud heritage.

Jim's quick wit, generous spirit, and unwavering loyalty made him a beloved husband, father, grandfather, and friend. He shared 45 wonderful years with his wife, Patricia, and was immensely proud of his son Michael (and wife Amanda), daughter Kathleen (and husband David), and his four grandchildren, who affectionately called him "Captain Grandpa."

**Survived by:** Wife Patricia O'Connor; son Michael O'Connor (wife Amanda); daughter Kathleen (husband David); 4 grandchildren.

**In lieu of flowers:** Donations may be made to the Navy-Marine Corps Relief Society in Jim's memory.

Fair winds and following seas, Captain. You will be dearly missed.`
  },

  // Example 3: Contemporary/Personal Tone with Quotes
  {
    id: "example-3-contemporary-quotes",
    name: "Dr. Aisha Patel",
    tone: "contemporary",
    style: "personal",
    isReligious: false,
    hasQuotes: true,
    hasMilitaryService: false,
    facts: `Generate a personal obituary for the following person, using a contemporary tone:

Name: Dr. Aisha Patel

Date of Birth: December 8, 1978
Date of Death: November 1, 2024
Location of Birth: Mumbai, India
Location of Death: Seattle, Washington
Cause of Death: Sudden illness

Biographical Info:
Occupation: Neurosurgeon and Medical Researcher
Company Name: Seattle Medical Center
Education: MD, Johns Hopkins University (2004); PhD in Neuroscience, Stanford University (2009)
Accomplishments: Published over 50 research papers; developed innovative surgical technique for treating pediatric brain tumors
Hobbies: Hiking, photography, cooking fusion cuisine
Interests: Medical education, mentoring young physicians, classical Indian dance

Family Info:
Survived By: Partner Alex Chen; parents Dr. Raj and Priya Patel; sister Nisha Patel (husband James)

Additional Details:
Funeral Service(s): Celebration of Life, November 10, 2024, 4:00 PM at Woodland Park Rose Garden, Seattle, WA
Special Acknowledgments: The family extends gratitude to the medical team at Seattle Medical Center

Meaningful Quotes & Scripture to incorporate naturally:
> "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate." (Ralph Waldo Emerson)`,
    obituary: `# Dr. Aisha Patel

**December 8, 1978 - November 1, 2024**

The world lost a brilliant mind and beautiful soul when Dr. Aisha Patel passed away on November 1, 2024, in Seattle, Washington, at the age of 45.

Born in Mumbai, India, Aisha's journey was one of relentless curiosity, compassion, and excellence. She earned her MD from Johns Hopkins University in 2004 and her PhD in Neuroscience from Stanford University in 2009, establishing herself as a leader in pediatric neurosurgery. Her groundbreaking work at Seattle Medical Center, particularly her innovative surgical technique for treating pediatric brain tumors, has saved countless young lives and will continue to impact the field for generations to come. With over 50 published research papers, Aisha's intellectual contributions were matched only by her dedication to mentoring the next generation of physicians.

> "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate." - Ralph Waldo Emerson

These words, among Aisha's favorites, perfectly captured how she lived. Beyond the operating room, she found balance and joy in the natural beauty of the Pacific Northwest, hiking its trails with her camera in hand, capturing stunning landscapes. She was an extraordinary cook who delighted friends and family with fusion dishes that honored her heritage while embracing new flavors. A trained classical Indian dancer, she brought grace and artistry to everything she did.

Aisha is survived by her devoted partner, Alex Chen; her loving parents, Dr. Raj and Priya Patel; and her sister Nisha Patel (husband James). She leaves behind countless colleagues, students, and patients whose lives were forever changed by her skill, kindness, and unwavering commitment to healing.

**Celebration of Life:** November 10, 2024, at 4:00 PM, Woodland Park Rose Garden, Seattle, Washington.

The family extends heartfelt gratitude to the exceptional medical team at Seattle Medical Center for their compassionate care.

Aisha's legacy of healing, innovation, and compassion will continue to inspire all who knew her and all whose lives she touched through her work.`
  }
];

/**
 * Criteria for selecting relevant examples
 */
export interface SelectionCriteria {
  tone: string;
  style: string;
  isReligious: boolean;
  hasQuotes: boolean;
  hasMilitaryService: boolean;
}

/**
 * Score an example based on how well it matches the selection criteria
 */
const scoreExample = (
  example: ObituaryExample,
  criteria: SelectionCriteria
): number => {
  let score = 0;

  // Exact tone match: +10 points
  if (example.tone.toLowerCase() === criteria.tone.toLowerCase()) {
    score += 10;
  }

  // Exact style match: +8 points
  if (example.style.toLowerCase() === criteria.style.toLowerCase()) {
    score += 8;
  }

  // Religious match: +5 points
  if (example.isReligious === criteria.isReligious) {
    score += 5;
  }

  // Quote presence match: +3 points
  if (example.hasQuotes === criteria.hasQuotes) {
    score += 3;
  }

  // Military service match: +3 points
  if (example.hasMilitaryService === criteria.hasMilitaryService) {
    score += 3;
  }

  return score;
};

/**
 * Select the most relevant examples based on the criteria
 * 
 * @param criteria - Selection criteria based on the user's request
 * @param count - Number of examples to return (default: 3)
 * @returns Array of selected examples, ordered by relevance
 */
export const selectExamples = (
  criteria: SelectionCriteria,
  count: number = 3
): ObituaryExample[] => {
  // Score all examples
  const scoredExamples = fewShotExamples.map(example => ({
    example,
    score: scoreExample(example, criteria)
  }));

  // Sort by score (highest first)
  scoredExamples.sort((a, b) => b.score - a.score);

  // Return top N examples
  return scoredExamples
    .slice(0, Math.min(count, scoredExamples.length))
    .map(item => item.example);
};

/**
 * Get all available examples (useful for testing or manual selection)
 */
export const getAllExamples = (): ObituaryExample[] => {
  return [...fewShotExamples];
};

/**
 * Get an example by ID
 */
export const getExampleById = (id: string): ObituaryExample | undefined => {
  return fewShotExamples.find(example => example.id === id);
};
