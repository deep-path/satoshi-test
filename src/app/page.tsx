import Image from "next/image";
import styles from "./page.module.css";

import Bridge from '../section/bridge'

export default function Home() {
  return (
    <main className={styles.main}>
      <Bridge />
    </main>
  );
}
