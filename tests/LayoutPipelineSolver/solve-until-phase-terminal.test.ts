import { expect, test } from "bun:test"
import { LayoutPipelineSolver } from "lib/solvers/LayoutPipelineSolver/LayoutPipelineSolver"
import type { InputProblem } from "lib/types/InputProblem"
import { normalizeSide } from "lib/types/Side"

test("LayoutPipelineSolver: solveUntilPhase does not loop indefinitely when solver is solved or terminal", () => {
  const problem: InputProblem = {
    chipMap: {
      C1: { chipId: "C1", pins: ["P1", "P2"], size: { x: 2.0, y: 1.0 } },
    },
    chipPinMap: {
      P1: { pinId: "P1", offset: { x: 0, y: 0 }, side: normalizeSide("left") },
      P2: {
        pinId: "P2",
        offset: { x: 10, y: 10 },
        side: normalizeSide("right"),
      },
    },
    netMap: {
      N1: { netId: "N1" },
    },
    pinStrongConnMap: {},
    netConnMap: {
      "P1-N1": true,
      "P3-N1": true,
    },
    chipGap: 0.2,
    partitionGap: 2,
  }

  const solver = new LayoutPipelineSolver(problem)

  // Requesting a nonexistent phase should not hang forever;
  // it should step until solved and safely return.
  solver.solveUntilPhase("nonExistentPhase")

  expect(solver.solved).toBe(true)
  expect(solver.failed).toBe(false)
})

test("LayoutPipelineSolver: solveUntilPhase terminates immediately if solver is already failed", () => {
  const problem: InputProblem = {
    chipMap: {},
    chipPinMap: {},
    netMap: {},
    pinStrongConnMap: {},
    netConnMap: {},
    chipGap: 0.2,
    partitionGap: 2,
  }

  const solver = new LayoutPipelineSolver(problem)
  solver.failed = true

  // Should return immediately without any steps or infinite looping
  solver.solveUntilPhase("somePhase")
  expect(solver.failed).toBe(true)
})
