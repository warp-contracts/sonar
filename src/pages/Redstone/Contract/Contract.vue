<template>
    <div class="providers-wrapper">
        <div class="contract-header">Contract</div>
        <div class="contract-details-wrapper">
            <div>{{ contractId }}</div>
            <div class="cell">
                <div>Owner:</div>
                <div>{{ owner }}</div>
            </div>
            <div class="cell">
                <div>Total interactions:</div>
                <div>{{ total }}</div>
            </div>
        </div>
        <div class="provider-tabs">
            <b-tabs>
                <b-tab title="Transactions">
                    <TxList :paging="pages" @page-clicked="onPageClicked">
                        <b-table
                            ref="table"
                            id="assets-table"
                            stacked="md"
                            hover
                            :sort-by="'id'"
                            :items="interactions"
                            :fields="fields"
                            @row-clicked="rowClicked"
                        >
                            <template #cell(transaction_id)="data">
                                {{ data.item.interactionId | tx }}
                            </template>

                            <template #cell(block_id)="data">
                                <a
                                    :href="
                                        `https://viewblock.io/arweave/block/${data.item.blockId}`
                                    "
                                    target="_blank"
                                >
                                    {{ data.item.blockId | tx }}
                                </a>
                            </template>

                            <template #cell(block_height)="data">
                                {{ data.item.blockHeight }}
                            </template>

                            <template #cell(function)="data">
                                {{ data.item.function }}
                            </template>

                            <template #cell(status)="data">
                                {{ data.item.status }}
                            </template>

                            <template #cell(confirmingPeers)="data">
                                {{ data.item.confirmingPeers }}
                            </template>

                            <template #cell(actions)="data">
                                <i
                                    v-if="!data.item._showDetails"
                                    class="fa fa-chevron-down"
                                />
                                <i v-else class="fa fa-chevron-up" />
                            </template>

                            <template slot="row-details" slot-scope="data">
                                <json-viewer
                                    :value="data.item.interaction"
                                    :expand-depth="1"
                                    copyable
                                    sort
                                ></json-viewer>
                            </template>
                        </b-table>
                        <div v-if="!interactions">
                            <div
                                v-for="n in 3"
                                :key="n"
                                class="preloader text-preloader manifest-preloader"
                            ></div>
                        </div>
                    </TxList>
                </b-tab>
                <b-tab title="Code">
                  <CodeSandbox :contractId="contractId"></CodeSandbox>
                </b-tab>
            </b-tabs>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import axios from 'axios';
import TxList from '@/components/TxList/TxList';
import { TagsParser } from 'redstone-smartweave';
import JsonViewer from 'vue-json-viewer';
import Arweave from 'arweave';
import CodeSandbox from "./CodeSandbox/CodeSandbox";

export default {
    name: 'Contract',

    data() {
        return {
            info: null,
            fields: [
                'transaction_id',
                'block_id',
                'block_height',
                'input',
                'function',
                'status',
                'confirmingPeers',
                { key: 'actions', label: '' },
            ],
            interactions: null,
            currentPage: 1,
            paging: 0,
            owner: '',
            arweave: null,
            contractTx: '',
            total: 0,
        };
    },

    mounted() {
        this.arweave = Arweave.init({
            host: 'arweave.net',
            protocol: 'https',
            port: 443,
        });
        this.getInteractions(this.currentPage);
        this.getContractTx();
    },

    created() {},

    components: {CodeSandbox, TxList, JsonViewer },
    computed: {
        contractId() {
            return this.$route.params.id;
        },
        pages() {
            return this.paging ? this.paging : null;
        },
    },

    methods: {
        rowClicked(record) {
            this.$set(record, '_showDetails', !record._showDetails);
        },
        async getContractTx() {
            this.contractTx = await this.arweave.transactions.get(
                this.contractId
            );
            this.owner = await this.arweave.wallets.ownerToAddress(
                this.contractTx.owner
            );
        },
        async onPageClicked(pageNumber) {
            this.currentPage = pageNumber;
            this.getContracts(this.currentPage);
        },
        async getInteractions(page) {
            this.interactions = [];
            axios
                .get(
                    `https://d1o5nlqr4okus2.cloudfront.net/gateway/interactions?contractId=${this.contractId}&limit=15&page=${page}`
                )

                .then(async (fetchedInteractions) => {
                    this.paging = fetchedInteractions.data.paging;
                    this.total = fetchedInteractions.data.interactions.length;
                    fetchedInteractions.data.interactions.forEach((i) => {
                        const obj = {
                            cursor: '',
                            node: i.interaction,
                        };
                        const tagsParser = new TagsParser();

                        this.interactions.push({
                            id: i.interaction.id,
                            interactionId: i.interaction.id,
                            blockId: i.interaction.block.id,
                            blockHeight: i.interaction.block.height,
                            function: JSON.parse(
                                tagsParser.getInputTag(obj, this.contractId)
                                    .value
                            ).function,
                            status: i.status,
                            input: JSON.parse(
                                tagsParser.getInputTag(obj, this.contractId)
                                    .value
                            ),
                            confirmingPeers: i.confirming_peers,
                            interaction: i.interaction,
                        });
                    });
                });
        },
        styleCategory(text, numberOfCategories, index) {
            return (
                _.startCase(text) + (index < numberOfCategories - 1 ? ', ' : '')
            );
        },
    },
};
</script>

<style src="./Contract.scss" lang="scss" scoped />
<style lang="scss">
.provider-tabs > .tabs > div:first-of-type {
    height: 44px;
}

.provider-tabs {
    .nav-tabs > .nav-item {
        flex: 0 0 124px;
    }
}

.contract-details-wrapper {
    padding: 17px;
    width: 50%;
    font-size: 16px;
    .cell {
        display: flex;
        margin-top: 10px;

        div:first-of-type {
            width: 200px;
        }
    }
}

.contract-header {
    font-size: 30px;
    padding-left: 17px;
}
</style>
