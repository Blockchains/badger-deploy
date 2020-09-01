import { BadgerSystem, Pool, Tranche } from '../../BadgerSystem'
import { BigNumber } from 'ethers'

export async function getActivePools(badger: BadgerSystem, timestamp: number): Promise<Pool[]> {
  const pools: Pool[] = []
  const tranches: Tranche[] = [...badger.badgerDistributionPools.tranches, ...badger.diggDistributionPools.tranches]

  for (const tranche of tranches) {
    for (const pool of tranche.pools) {
        const {start, end} = await getPoolStartEndTimes(pool);
        if (start >= timestamp && end <= timestamp) {
            pools.push(pool)
        }
    }
  }
  return pools;
}

export function getAllPools(badger: BadgerSystem): Pool[] {
  const pools: Pool[] = []
  const tranches: Tranche[] = [...badger.badgerDistributionPools.tranches, ...badger.diggDistributionPools.tranches]

  for (const tranche of tranches) {
    for (const pool of tranche.pools) {
            pools.push(pool)
    }
  }
  return pools;
}

export async function getCompletedPools(badger: BadgerSystem, timestamp: number): Promise<Pool[]> {
    const pools: Pool[] = []
    const tranches: Tranche[] = [...badger.badgerDistributionPools.tranches, ...badger.diggDistributionPools.tranches]

    for (const tranche of tranches) {
      for (const pool of tranche.pools) {
          const {start, end} = await getPoolStartEndTimes(pool);
          if (end > timestamp) {
              pools.push(pool)
          }
      }
    }
    return pools;
}

export async function getFuturePools(badger: BadgerSystem, timestamp: number): Promise<Pool[]> {
    const pools: Pool[] = []
    const tranches: Tranche[] = [...badger.badgerDistributionPools.tranches, ...badger.diggDistributionPools.tranches]

    for (const tranche of tranches) {
      for (const pool of tranche.pools) {
          const {start, end} = await getPoolStartEndTimes(pool);
          if (start < timestamp) {
              pools.push(pool)
          }
      }
    }
    return pools;
}

export async function getPoolStartEndTimes(pool: Pool): Promise<{start: number, end: number}> {
    const startTime = await pool.contract.globalStartTime()
    const endTime = startTime.add(await getPoolTotalDuration(pool))
    return {
        start: startTime.toNumber(),
        end: endTime.toNumber()
    }
}

export async function getPoolTotalDuration(pool: Pool): Promise<number> {
  let time = BigNumber.from(0)
  const scheduleCount = pool.contract.unlockScheduleCount()

  for (let i = 0; i < scheduleCount.toNumber(); i++) {
    const schedule = await pool.contract.unlockSchedules(i)
    time = time.add(schedule.durationSec)
  }

  return time.toNumber()
}
