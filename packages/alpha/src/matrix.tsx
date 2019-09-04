import React, { FC, useEffect, useState } from 'react'
import { random } from '@alpha/utils'

export enum Color {
  dead = 0,
  live = 1,
}
type Matrix = Color[][]

const Cell: FC<{ color: Color }> = ({ color }) => <div className={`cell ${color === 1 ? 'black' : 'white'}`} />

export const countLiveAround = (matrix: Matrix, i: number, j: number) => {
  let count = 0
  for (let y = Math.max(0, i - 1); y <= Math.min(matrix.length - 1, i + 1); y++) {
    for (let x = Math.max(0, j - 1); x <= Math.min(matrix[i].length - 1, j + 1); x++) {
      if (y !== i || x !== j) {
        count += matrix[y][x]
      }
    }
  }
  return count
}

export const initializeMatrix = (length: number=0): Matrix =>
  Array.from(Array(length).keys()).map(() => Array.from(Array(length).keys()).map(() => random(2)))

const transformCell = (matrix: Matrix = [], i: number) => (color: Color, j: number) => {
  const liveAround = countLiveAround(matrix, i, j)
  if (color === Color.live) {
    if (liveAround === 2 || liveAround === 3) {
      return Color.live
    } else {
      return Color.dead
    }
  } else {
    if (liveAround === 3) {
      return Color.live
    } else {
      return Color.dead
    }
  }
}

export const transformMatrix = (matrix: Matrix = []): Matrix => matrix.map((row, i) => row.map(transformCell(matrix, i)))

export const Grid: FC<{ interval: number; matrixLength: number }> = ({ interval = 1000, matrixLength = 50 }) => {
  const [cells, changeCells] = useState<Matrix>(initializeMatrix(matrixLength))

  useEffect(() => {
    const intervalId = setInterval(() => {
      changeCells(transformMatrix)
    }, interval)
    return () => clearInterval(intervalId)
  }, [interval])

  return (
    <div>
      {cells.flatMap((row, i) => (
        <div key={`${i}`} className={'row'}>
          {row.map((color, j) => (
            <Cell key={`${j}`} color={color} />
          ))}
        </div>
      ))}
    </div>
  )
}
