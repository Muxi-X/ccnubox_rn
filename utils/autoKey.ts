function* autoKey() {
  let key = 0;
  while (1) {
    yield key++--;
  }
}

export const keyGenerator = autoKey();
