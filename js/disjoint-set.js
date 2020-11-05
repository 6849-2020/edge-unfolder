class DisjointSet {
  constructor(size) {
    this.size = size;
    this.parent = [];
    this.rank = [];

    for (var i = 0; i < size; i++) {
      this.parent.push(i);
      this.rank.push(0);
    }
  }

  // find parent of i, with path compression
  find(i) {
    // If i is the parent of itself
    if (this.parent[i] == i) {
        // Then i is the representative of his set
        return i;
    } else { // Else if i is not the parent of itself
        // Then i is not the representative of his set,
        // so we recursively call Find on it's parent, and save it in our result variable
        let result = this.find(this.parent[i]);

        // We then cache the result by moving i's node directly under the representative of his set
        this.parent[i] = result;

        // And then we return the result
        return result;
    }
  }

  // Unites the set that includes i and the set that includes j
  union(i, j) {

    // Find the representatives (or the root nodes) for the set that includes i
    let irep = this.find(i);
    // And do the same for the set that includes j
    let jrep = this.find(j);
    // Get the rank of i's tree
    let irank = this.rank[irep];
    // Get the rank of j's tree
    let jrank = this.rank[jrep];

    // Elements are in the same set, no need to unite anything.
    if (irep == jrep)
        return;

    // If i's rank is less than j's rank
    if (irank < jrank) {
        // Then move i under j
        this.parent[irep] = jrep;
    } // Else if j's rank is less than i's rank
    else if (jrank < irank) {
        // Then move j under i
        this.parent[jrep] = irep;
    } // Else if their ranks are the same
    else {
        // Then move i under j (doesn't matter which one goes where)
        this.parent[irep] = jrep;

        // And increment the the result tree's rank by 1
        this.rank[jrep]++;
    }
  }
}
