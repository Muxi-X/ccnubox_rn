function* autoKey() {
  let key = 0;
  while (1) {
    yield key++;
  }
}
/**
 * 无情的 key 生成机器
 * 无限生成唯一的 key 值。
 * @returns {Generator<number, void, void>} 一个生成器函数，每次调用 next() 会返回一个递增的唯一 key。
 * @example
 * const keyGen = keyGenerator;
 * console.log(keyGen.next().value); // 输出: 0
 * console.log(keyGen.next().value); // 输出: 1
 * console.log(keyGen.next().value); // 输出: 2
 * // 以此类推...
 */
export const keyGenerator = autoKey();
