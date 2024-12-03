// import type { Core } from '@strapi/strapi';

import { IMessage, MessageType } from "../types/entities";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  //bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
  bootstrap({ strapi }) {
    const WebSocket = require('ws');
    const httpServer = strapi.server.httpServer;
    const wss = new WebSocket.Server({ server: httpServer });
    let interval :NodeJS.Timeout;
    wss.on('connection', async function (ws:any) {
      const towerControl = await strapi.documents('api::tower-control.tower-control').findFirst();
      const towerMonitor = await strapi.documents('api::tower-monitor.tower-monitor').findFirst();

      if (interval) clearInterval(interval);
      console.log('User connected');
    
      interval = setInterval(() => ws.send(
        JSON.stringify({ time: new Date().getTime()})),
        1000
      );
      //menerima event message dari manapun
      ws.on('message', async (message:any) => {
        const msgObj:IMessage = JSON.parse(message);
        /*
        jika event CONTROL_UPDATE diterima, berarti ada update kontrol dari HP, 
        maka tabel tower-control harus diupdate lalu data kontrolnya dikirim sebagai info: CONTROL_INFO
        */
        if(msgObj.type === MessageType.CONTROL_UPDATE){
          if(towerControl){
            try {
              await strapi.documents('api::tower-control.tower-control').update({
                documentId: towerControl.documentId,
                data: { values: msgObj.values }
              });
              const msgInfoObj:IMessage = {
                type: MessageType.CONTROL_INFO,
                values: msgObj.values
              }
              ws.send(JSON.stringify(msgInfoObj)); 
            } catch (error) {
              console.log(error);
            }
          }
        }
        /*
        jika event MONITOR_UPDATE diterima, berarti ada update monitoring data dari ESP, 
        maka tabel tower-monitor harus diupdate lalu data monitornya dikirim sebagai info: MONITOR_INFO
        */
        else if (msgObj.type === MessageType.MONITOR_UPDATE){
          if(towerMonitor){
            try {
              await strapi.documents('api::tower-monitor.tower-monitor').update({
                documentId: towerMonitor.documentId,
                data: { values: msgObj.values }
              });
              const msgInfoObj:IMessage = {
                type: MessageType.MONITOR_INFO,
                values: msgObj.values
              }
              ws.send(JSON.stringify(msgInfoObj)); 
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
}}