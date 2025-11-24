const colums = [
  ["_", "+", "13", "*", "_", "/"],
  [null, null, null, null, null, "_"],
  ["_", "*", "12", "+", "_", "+"],
  ["-", null, null, null, null],
  ["_", "-", "11", "+", "_", "*"],
  [null, null, null, null, null, "_"],
  ["66", "=", "10", "-", "_", "/"],
];
const visited = []
const finalCell = [6, 0]
const outerLength = colums.length
const innerLength = colums[0].length

const direction = [[0, -1], [1, 0], [0, 1], [-1, 0]]

function getCellElement(input) {
  const cell = document.createElement("input");
  cell.classList.add("cell");
  if (input === null) {
    cell.classList.add("ghost")
  } else if (input === "_") {
    cell.max = 9;
    cell.min = 1;
    cell.type = "number";
  } else {
    cell.value = input;
    cell.disabled = true
  }
  return cell;
}

const dirNames = ["top", "right", "bottom", "left"]
function cellStatus(outer, inner) {
  const dirStatus = {}
  direction.forEach((dir, index) => {
    dirStatus[dirNames[index]] = cellExist(outer + dir[0], inner + dir[1])
  }
  )
  return dirStatus
}

function cellExist(outer, inner) {
  if (outer >= 0 && outer < outerLength && inner >= 0 && inner < innerLength) {
  }
  const value = outer >= 0 && outer < outerLength && inner >= 0 && inner < innerLength && colums[outer][inner] !== null && visited.includes(`${outer}-${inner}`)
  return value
}

colums.forEach((col, indexOut) => {
  const newColum = document.createElement("div")
  newColum.classList.add("col")
  col.forEach((item, indexIn) => {
    const status = cellStatus(indexOut, indexIn)
    const cell = getCellElement(item)
    Object.entries(status).forEach(([key, value]) => {
      cell.classList.add(`${key}-${value ? 'hide' : "show"}`)
    })
    cell.classList.add(`cell-${indexOut}-${indexIn}`)
    newColum.appendChild(cell)
    visited.push(`${indexOut}-${indexIn}`)
    // prevent typing — allow only arrows
    cell.onchange = (e) => {
      let num = Number(e.target.value);
      console.log({ num })
      // invalid input -> revert to previous value (or blank)
      if (num < 1 || num > 9 || isNaN(num)) {
        e.target.value = colums[indexOut][indexIn] ?? "";
        return;
      }

      update(num, indexOut, indexIn);
    };
  })
  box.appendChild(newColum)
})

const data = `.cell-${finalCell[0]}-${finalCell[1]}`
const finalCellElement = document.querySelector(data)
finalCellElement.classList.add('final')

function update(value, outer, inner) {
  let num = Number(value);
  if (num > 9 || num < 1) return;
  colums[outer][inner] = value
  const total = recalculateTotal()
  console.log({ total, colums })
  if (total === null) return;
  finalCellElement.value = total

  if (total === 66) {
    const hasEmpty = colums.some(row => row.includes("_"));
    if (hasEmpty) return; // don't win yet

    const winBox = document.createElement("div");
    winBox.classList.add("win-message");
    winBox.innerHTML = `
      <h2>You have won the game! 🎉</h2>
      <button id="replay-btn">Replay</button>
    `;
    document.body.appendChild(winBox);

    document.getElementById("replay-btn").onclick = () => location.reload();
  }

}

function recalculateTotal() {
  const symbols = "+-*/";
  let expression = [];

  // start from 0,0
  let row = 0;
  let col = 0;
  let visitedCells = new Set();

  while (true) {
    const curr = colums[row][col];

    if (curr === "_" || curr === "=") break;
    if (curr !== null) {
      if (symbols.includes(curr)) {
        expression.push(curr);
      } else {
        const num = Number(curr);
        if (!isNaN(num)) expression.push(num);
      }
    }

    visitedCells.add(`${row}-${col}`);

    // find next neighbor that is NOT null and NOT visited
    let moved = false;
    for (let [dr, dc] of direction) {
      const nr = row + dr;
      const nc = col + dc;

      if (
        nr >= 0 && nr < outerLength &&
        nc >= 0 && nc < innerLength &&
        colums[nr][nc] !== null &&
        !visitedCells.has(`${nr}-${nc}`)
      ) {
        row = nr;
        col = nc;
        moved = true;
        break;
      }
    }

    if (!moved) break;
  }

  if (expression.length === 0) return null;

  while (symbols.includes(expression.at(-1))) expression.pop();
  if (expression.length === 0) return null;

  // PEMDAS
  const pemdas = (expr, ops) => {
    for (let i = 0; i < expr.length; i++) {
      if (ops.includes(expr[i])) {
        const r = {
          "*": expr[i - 1] * expr[i + 1],
          "/": expr[i - 1] / expr[i + 1],
          "+": expr[i - 1] + expr[i + 1],
          "-": expr[i - 1] - expr[i + 1],
        }[expr[i]];
        expr.splice(i - 1, 3, r);
        i--;
      }
    }
  };

  pemdas(expression, ["*", "/"]);
  pemdas(expression, ["+", "-"]);

  return expression[0];
}




