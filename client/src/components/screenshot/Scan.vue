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
          <span>Starting scan</span>
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
  </v-container>
</template>

<script>
  import Axios from 'axios';

  export default {
    name: 'Scan',

    data () {
      const defaultForm = Object.freeze({
        target_list: '',
        http_ports: '',
        https_ports: '',
        optionValues: ["images", "scripts"]
      })

      const scanOptions = [
        {
          text: 'Request Images', value: "images"
        },
        {
          text: 'Request Scripts', value: "scripts"
        },
      ];

      return {
        form: Object.assign({}, defaultForm),
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
      formIsValid () {
        return (
          (this.form.http_ports || this.form.https_ports) &&
          this.form.target_list
        )
      },
    },

    methods: {
      clearForm () {
        this.form = Object.assign({}, this.defaultForm)
        this.$refs.form.reset()
      },

      async submit () {
        const targets = this.formatTargets(this.form);
        const options = this.formatOptions(this.form);

        // TODO: get configured server url
        const res = await Axios.post('http://localhost:3000/scan/screenshots',
          {
            "options": options,
            "targets": targets
          }
        );

        this.snackbar = true
        this.resetForm()
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
