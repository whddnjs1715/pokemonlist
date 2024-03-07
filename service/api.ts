import axios, { AxiosError, Method } from 'axios'
import Service, { CallbackModel, ServiceGetConfigModel, ServicePostConfigModel } from 'service/service'

class API<T> implements Service<T> {
    url = ''

    method: Method | undefined = undefined
  
    config: ServiceGetConfigModel<T> | ServicePostConfigModel<T> = {}
  
    callback: CallbackModel | null = null
  
    customData: any = undefined

    constructor(url: string, method: Method, callback: CallbackModel) {
        this.url = url
        this.method = method
        this.callback = callback
    }    

    async call(customData?: any) {
        await axios({
          url: this.url,
          method: this.method,
          params: this.config.params ? this.config.params : undefined,
        })
          .then((res) => {
            const data = res.data
            this.callback?.success(data, customData)
          })
          .catch((err: AxiosError) => {
            if (this.callback?.error) {
                this.callback?.error(err)
              }
          })
          .finally(() => {
            if (this.callback?.finally) {
              this.callback.finally()
            }
          })
      }   
  
    set(config: ServiceGetConfigModel<T> | ServicePostConfigModel<T>): void {
        throw new Error('set method not implemented.')
    }

    setUrl(url: string) {
      this.url = url
    }    
}

export default API
