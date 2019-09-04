import React, { FC } from 'react'
import { hot } from 'react-hot-loader/root'
import { Grid } from "@alpha/matrix";

const Main: FC<{}> = () => (
  <section>
    <Grid interval={1000} matrixLength={50} />
  </section>
)

export default hot(Main)
