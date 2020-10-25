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
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.http_ports"
                  :rules="rules.name"
                  color="purple darken-2"
                  label="http ports"
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.https_ports"
                  :rules="rules.name"
                  color="blue darken-2"
                  label="https ports"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="form.host_list"
                  color="teal"
                >
                  <template v-slot:label>
                    <div>
                      Hosts to scan
                    </div>
                  </template>
                </v-textarea>
              </v-col>
            </v-row>
          </v-container>
          <v-card-actions>
            <v-btn
              text
              @click="resetForm"
            >
              Reset
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
      host_list: '',
      http_ports: '',
      https_ports: ''
    })

    return {
      form: Object.assign({}, defaultForm),
      rules: {

      },

      conditions: false,
      snackbar: false,
      terms: false,
      defaultForm,
    }
  },

  computed: {
    formIsValid () {
      return (
        this.form.http_ports &&
        this.form.https_ports &&
        this.form.host_list
      )
    },
  },

// curl -X POST -d '{ "hosts": [ { "host": "facebook.com", "protocol": "https", "port": 443 } ] }' -H 'content-type: application/json' localhost:3000/scan^C

  methods: {
    resetForm () {
      this.form = Object.assign({}, this.defaultForm)
      this.$refs.form.reset()
    },
    async submit () {
      const data = this.formatData(this.form);
      console.log("data to send: " + data);

      const res = await Axios.post('http://localhost:3000/scan', {"hosts": data});
      console.log(res);
      this.snackbar = true
      this.resetForm()
    },
    formatData(data) {
      const hosts = [];

      for(let host of data.host_list.split("\n")) {
        for (let port of data.http_ports.split(",")) {
          hosts.push({host, port, protocol: "http"});
        }
        for (let port of data.https_ports.split(",")) {
          hosts.push({host, port, protocol: "https"});
        }
      }

      return hosts;
    }
  },
  }

</script>
