<template>
  <v-container>
    <v-card flat>
      <v-form
        ref="form"
        @submit.prevent="scanSubmit"
      >
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-textarea
                outlined
                v-model="form.target_list"
                color="teal"
                dense
              >
                <template v-slot:label>
                  <div>
                    Targets
                  </div>
                </template>
              </v-textarea>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.http_ports"
                :rules="rules.name"
                color="purple darken-2"
                label="http ports"
                required
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.https_ports"
                :rules="rules.name"
                color="blue darken-2"
                label="https ports"
                required
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.optionValues"
                :items="scanOptions"
                item-text="text"
                item-value="value"
                label="Scan Options"
                multiple
                outlined
                dense
              ></v-select>
            </v-col>
          </v-row>
        </v-container>

        <v-card-actions>
          <v-btn
            text
            @click="clearForm"
          >
            Clear
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!formIsValid"
            text
            color="primary"
            type="submit"
          >
            Scan
          </v-btn>
        </v-card-actions>
      </v-form>
      
      <div class="text-center">
        Screenshots remaining: {{ TOTAL_SCREENSHOTS_QUEUED }}
      </div>
    </v-card>

    <v-card flat style="margin-top:20px">
      <v-toolbar>
        <v-spacer></v-spacer>
        <v-toolbar-title>
          Workers
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-on:click="show_worker_add_form = !show_worker_add_form" icon>
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-toolbar>

      <v-container v-if="show_worker_add_form">
        <v-form
          ref="worker_form"
          @submit.prevent="addWorkerSubmit"
        >

          <v-text-field
            v-model="worker_name"
            label="Friendly worker name"
            required
          ></v-text-field>

          <v-text-field
            v-model="worker_url"
            label="Chrome debug URL (ex: http://localhost:9222)"
            required
          ></v-text-field>

          <v-text-field
            v-model="worker_tabs"
            label="# browser tabs to use (recommended: logical cores * 2)"
            required
          ></v-text-field>

          <v-btn
            text
            color="primary"
            type="submit"
          >
            Add Worker
          </v-btn>
        </v-form>
      </v-container>

      <v-container style="width:90%">
        <v-layout row wrap>
          <v-flex v-for="worker in WORKERS" :key="worker.id">
            <v-card 
              outlined
              width="175px"
            >
              <div class="text-center">
                <v-card-text>{{worker.name}}</v-card-text>
                <v-icon size="95">mdi-camera</v-icon>
              </div>

              <v-card-text>Queued: {{worker.queued}}</v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn icon>
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>

    </v-card>
  </v-container>
</template>

<script>
  import Axios from 'axios';
  import {mapGetters} from 'vuex';

  export default {
    name: 'Scan',

    data () {
      const defaultForm = {
        target_list: '',
        http_ports: '',
        https_ports: '',
        optionValues: ["images", "scripts"]
      }

      const scanOptions = [
        {
          text: 'Request Images', value: "images"
        },
        {
          text: 'Request Scripts', value: "scripts"
        },
      ];

      return {
        form: defaultForm,
        rules: {

        },

        worker_url: "",
        worker_name: "",
        worker_tabs: "",

        conditions: false,
        show_worker_add_form: false,
        terms: false,
        defaultForm,
        scanOptions,
      }
    },

    computed: {
      ...mapGetters(["JOBS"]),
      ...mapGetters(["WORKERS", "TOTAL_SCREENSHOTS_QUEUED"]),

      formIsValid () {
        return (
          (this.form.http_ports || this.form.https_ports) &&
          this.form.target_list
        )
      },
    },

    mounted() {
      //this.$store.dispatch("SET_JOBS");
      this.$store.dispatch("SET_WORKERS");
    },

    methods: {
      clearForm () {
        this.form = this.defaultForm;
        //this.$refs.form.reset()
      },

      async scanSubmit () {
        const targets = this.formatTargets(this.form);
        const options = this.formatOptions(this.form);

        const res = await Axios.post('http://localhost:3000/scan/screenshots',
          {
            "options": options,
            "targets": targets
          }
        );

        this.$store.dispatch("SET_WORKERS", res["data"]["workers"]);

        this.$store.dispatch('setSnackbar', {
          showing: true,
          text: "Added to scan queue",
          color: 'success',
          icon: 'mdi-checkbox-marked-circle'
        });

        this.clearForm()
      },
      async addWorkerSubmit() {
        const res = await Axios.post('http://localhost:3000/workers/add',
          {
            "worker_name": this.worker_name,
            "worker_url": this.worker_url,
            "worker_tabs": this.worker_tabs
          }
        );

        console.log("data: ", res["data"]);

        if (res["data"]["success"] == true) {
          this.$store.dispatch("SET_WORKERS", res["data"]);
          this.$store.dispatch('setSnackbar', {
            showing: true,
            text: "Successfully added worker",
            color: 'success',
            icon: 'mdi-checkbox-marked-circle'
          });
          this.clearForm()
        } else {
          this.$store.dispatch('setSnackbar', {
            showing: true,
            text: "Failed to add worker: " + res["data"]["error"],
            color: 'error',
            icon: 'mdi-checkbox-marked-circle'
          });
        }
      },
      formatTargets(form) {
        const targets = [];

        for(let target of form.target_list.split("\n")) {
          targets.push(target);
        }

        return targets;
      },
      formatOptions(form) {
        // defaults
        var scan_options = {
          "images": true,
          "scripts": true,
        };

        // merge defaults with present options
        for (const [key] of Object.entries(scan_options)) {
          if (!form.optionValues.includes(key)) {
            scan_options[key] = false;
          }
        }

        var http_ports = form.http_ports.split(",");
        var https_ports = form.https_ports.split(",");

        return {...scan_options, http_ports, https_ports};
      }
    },
  }

</script>
