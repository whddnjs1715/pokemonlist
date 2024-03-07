import { Method, AxiosError } from 'axios'


export interface ServiceGetConfigModel<T> {
  params?: T
  data?: any
}

export interface ServicePostConfigModel<T> {
  data?: T
  params?: undefined
}

export interface ErrorModel {
  code: number
  msg: string
  isCancel: boolean
  isAxiosError: boolean
}

export interface CallbackModel {
  success: (data: any, customData?: any) => void
  error?: (err: AxiosError) => void
  finally?: () => void
}

abstract class Service<T> {
  abstract url: string

  abstract method: Method | undefined

  abstract config: ServiceGetConfigModel<T> | ServicePostConfigModel<T>

  abstract callback?: CallbackModel | null | undefined

  abstract customData: any

  abstract set(config: ServiceGetConfigModel<T> | ServicePostConfigModel<T>): void

  abstract call(customData: any): Promise<void>
}

export default Service
