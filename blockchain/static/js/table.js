/*!
 * --------------------------------------- START OF LICENSE NOTICE ------------------------------------------------------
 * Copyright (c) 2015 Software Robotics Corporation Limited ("Soroco"). All rights reserved.
 *
 * NO WARRANTY. THE PRODUCT IS PROVIDED BY SOROCO "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL SOROCO BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE PRODUCT, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
 * DAMAGE.
 * ---------------------------------------- END OF LICENSE NOTICE -------------------------------------------------------
 *
 *   Primary Author: Nishant Jain <nishant@soroco.com>
 *
 *   Purpose: This file defines the SRC table component
 */

SRC.Table = function(args)
{
    /*validations*/
    if (!args.dataURL && !args.data_handler) throw "SRC.Table needs a data url or data handler";

    /*arguments processing*/
    this.div = args.div;
    this.dataURL = args.dataURL;
    this.dataURLArgs = args.dataURLArgs;
    this.data_handler = args.data_handler;
    this.dataURLArgsCheck = args.dataURLArgsCheck || false;
    this.columnDefs = args.columnDefs;
    this.refreshFreq =args.refreshFreq;
    this.dataFunc = args.dataFunc || function(data){ return data;};
    this.order = args.order || [];
    this.buttons = args.buttons || [];
    this.select = args.select || false;
    this.blockOnRefresh = args.blockOnRefresh || false;
    this.blockCustomDiv = args.blockCustomDiv;
    this.blockMessage = args.blockMessage || "";

    /*storing table object to make it accessible inside non object functions*/
    var SRCTableObj = this;

    /*data table initialization*/
    this.table = $('#' + this.div).dataTable({
        columnDefs: this.columnDefs,
        order: this.order,
        dom: 'lfBrtip',
        buttons: this.buttons,
        select: this.select,
    })

    /*function to render table with the data*/
    this.refresh_table = function(data){
        this.table.api().clear();
        this.table.api().rows.add(data).draw();
    }

    this.blockAll = function(){
            if(this.blockOnRefresh == false)
            {
                return;
            }
            if(typeof this.blockCustomDiv !='undefined')
            {
                $('#' + this.blockCustomDiv).block({ message: this.blockMessage });
            }
            else
            {

                $('#' + this.div).block({ message: this.blockMessage });
            }

    }

    this.unBlockAll = function(){
            if(this.blockOnRefresh == false)
            {
                return;
            }
            if(typeof this.blockCustomDiv !='undefined')
            {
               $('#' + this.blockCustomDiv).unblock();
            }
            else
            {
                 $('#' + this.div).unblock();
            }
    }

    /*update function for getting the data and rendering the table*/
    this.refreshData = function(){
        // If dataURL is present then make ajax call to get data else use the data passed with the SRC object.
        if(typeof SRCTableObj.dataURL != 'undefined') {
            $.ajax({
                SRCDataURLArgs: ((typeof SRCTableObj.dataURLArgs == 'undefined') ?"":  "?" + SRCTableObj.dataURLArgs()),
                url: SRCTableObj.dataURL + ((typeof SRCTableObj.dataURLArgs == 'undefined') ?"":  "?" + SRCTableObj.dataURLArgs()),
                dataType: 'json',
                beforeSend: function(){
                     SRCTableObj.blockAll();
                },
                success: function (data) {
                    curDataURLArgs = ((typeof SRCTableObj.dataURLArgs == 'undefined') ?"":  "?" + SRCTableObj.dataURLArgs());
                    if((SRCTableObj.dataURLArgsCheck == false) || (curDataURLArgs == this.SRCDataURLArgs))
                    {
                        normalize_data = SRCTableObj.dataFunc(data);
                        SRCTableObj.refresh_table(normalize_data);
                    }
                },
                complete: function(){
                    SRCTableObj.unBlockAll();
                }
            });
        }
        else {
            data = SRCTableObj.data_handler();
            normalize_data = SRCTableObj.dataFunc(data);
            SRCTableObj.refresh_table(normalize_data);
        }
    }

    /*get the data first time*/
    this.refreshData();

    /*setup refresh of data at the refresh frequency*/
    setInterval(function () {
        SRCTableObj.refreshData();
    }, SRCTableObj.refreshFreq);

}