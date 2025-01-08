interface CsvMealItem {
  name: string;
  type: 'main' | 'side';
  notes: string;
  effort: number;
  tags: string[];
}

export function parseMealItemsCsv(csvContent: string): CsvMealItem[] {
  const lines = csvContent.split('\n');
  
  // Remove header row and empty lines
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  return dataLines.map(line => {
    const [name, type, notes, effort, tag1, tag2, tag3] = line
      .split(',')
      .map(field => field.trim());

    // Validate type
    if (type !== 'main' && type !== 'side') {
      throw new Error(`Invalid meal type "${type}" for item "${name}". Must be "main" or "side".`);
    }

    // Validate effort (1-3)
    const effortNum = parseInt(effort, 10);
    if (isNaN(effortNum) || effortNum < 1 || effortNum > 3) {
      throw new Error(`Invalid effort value "${effort}" for item "${name}". Must be 1, 2, or 3.`);
    }

    // Collect non-empty tags
    const tags = [tag1, tag2, tag3].filter(tag => tag && tag.trim());

    return {
      name,
      type: type as 'main' | 'side',
      notes,
      effort: effortNum,
      tags
    };
  });
} 