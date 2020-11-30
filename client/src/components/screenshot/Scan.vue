<template>
  <v-container>
    <v-row>
      <v-card flat>
        <v-snackbar
          v-model="snackbar"
          absolute
          top
          right
          color="success"
        >
          <span>Added to scan queue</span>
          <v-icon dark>
            mdi-checkbox-marked-circle
          </v-icon>
        </v-snackbar>

        <v-form
          ref="form"
          @submit.prevent="submit"
        >
          <v-container fluid>
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
      </v-card>
    </v-row>

    <v-row>
      Screenshots remaining: {{ Object.keys(JOBS).length }}
    </v-row>

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

        conditions: false,
        snackbar: false,
        terms: false,
        defaultForm,
        scanOptions,
      }
    },

    computed: {
      ...mapGetters(["JOBS"]),

      formIsValid () {
        return (
          (this.form.http_ports || this.form.https_ports) &&
          this.form.target_list
        )
      },
    },

    mounted() {
      this.$store.dispatch("SET_JOBS");
    },

    methods: {
      clearForm () {
        this.form = this.defaultForm;
        //this.$refs.form.reset()
      },

      async submit () {
        const targets = this.formatTargets(this.form);
        const options = this.formatOptions(this.form);

        const res = await Axios.post('http://localhost:3000/scan/screenshots',
          {
            "options": options,
            "targets": targets
          }
        );

        this.$store.dispatch("ADD_JOBS", res["data"]);


        this.snackbar = true
        this.clearForm()
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
