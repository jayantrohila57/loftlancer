export function totalFromCountAggregate(
  rows: ReadonlyArray<{ count: number }>,
): number {
  return rows[0]?.count ?? 0;
}

export function actionCountsFromGroupAggregate(
  rows: ReadonlyArray<{ action: string; count: number }>,
): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.action] = row.count;
    return acc;
  }, {});
}
